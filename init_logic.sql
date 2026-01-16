-- =====================================================
-- init_logic.sql
-- 통합 데이터베이스 로직 정의 (Functions, Triggers, RLS Policies)
-- 버전: 1.0.0
-- =====================================================

-- 1. 유틸리티 및 번호 생성 함수

-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 번호 생성 (ORD-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'ORD-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
        IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
            NEW.order_number := new_number;
            EXIT;
        END IF;
        counter := counter + 1;
        IF counter > 9999 THEN RAISE EXCEPTION 'Order number overflow'; END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 물류 요청 번호 생성 (SUP-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_supply_request_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'SUP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
        IF NOT EXISTS (SELECT 1 FROM supply_requests WHERE request_number = new_number) THEN
            NEW.request_number := new_number;
            EXIT;
        END IF;
        counter := counter + 1;
        IF counter > 9999 THEN RAISE EXCEPTION 'Supply request number overflow'; END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 반품 요청 번호 생성 (RET-YYYYMMDD-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS return_request_number_seq;
CREATE OR REPLACE FUNCTION generate_return_request_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.request_number IS NULL THEN
        NEW.request_number := 'RET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('return_request_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 배송 번호 생성 (SHIP-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT := TO_CHAR(NOW(), 'YYYYMMDD');
    new_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        new_number := 'SHIP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
        IF NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = new_number) THEN
            NEW.shipment_number := new_number;
            EXIT;
        END IF;
        counter := counter + 1;
        IF counter > 9999 THEN RAISE EXCEPTION 'Shipment number overflow'; END IF;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. 비즈니스 로직 함수

-- 지점 생성 시 모든 활성 상품 자동 초기화
CREATE OR REPLACE FUNCTION initialize_store_products()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO store_products (store_id, product_id, price, stock_quantity, is_available)
    SELECT 
        NEW.id, p.id, p.base_price, 0, true
    FROM products p
    WHERE p.is_active = true
    ON CONFLICT (store_id, product_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 주문 완료 시 재고 차감 및 알림 생성
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    store_name TEXT;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        SELECT name INTO store_name FROM stores WHERE id = NEW.store_id;
        
        -- 고객 알림
        INSERT INTO notifications (user_id, type, title, message, data, priority)
        VALUES (
            NEW.customer_id, 'order_completed', '주문 완료',
            '주문 ' || NEW.order_number || '가 완료되었습니다.',
            jsonb_build_object('order_id', NEW.id, 'store_name', store_name), 'high'
        );
        
        -- 재고 차감 및 이력 기록
        FOR item IN SELECT product_id, quantity FROM order_items WHERE order_id = NEW.id LOOP
            UPDATE store_products 
            SET stock_quantity = GREATEST(0, stock_quantity - item.quantity)
            WHERE store_id = NEW.store_id AND product_id = item.product_id;
            
            INSERT INTO inventory_transactions (store_product_id, transaction_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, reason, created_by)
            SELECT id, 'out', item.quantity, stock_quantity + item.quantity, stock_quantity, 'order', NEW.id, '주문 완료', NEW.customer_id
            FROM store_products WHERE store_id = NEW.store_id AND product_id = item.product_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 반품 승인 시 재고 복구
CREATE OR REPLACE FUNCTION handle_return_request_approval()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        FOR item IN SELECT product_id, approved_quantity, product_name FROM return_request_items WHERE return_request_id = NEW.id AND approved_quantity > 0 LOOP
            UPDATE store_products SET stock_quantity = stock_quantity + item.approved_quantity
            WHERE store_id = NEW.store_id AND product_id = item.product_id;
            
            INSERT INTO inventory_transactions (store_product_id, transaction_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, reason, created_by)
            SELECT id, 'in', item.approved_quantity, stock_quantity - item.approved_quantity, stock_quantity, 'return_request', NEW.id, '반품 승인: ' || item.product_name, NEW.approved_by
            FROM store_products WHERE store_id = NEW.store_id AND product_id = item.product_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 마케팅 및 포인트 로직

-- 포인트 변경 시 멤버십 등급 자동 업데이트
CREATE OR REPLACE FUNCTION trigger_update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total_earned_points > OLD.total_earned_points THEN
        UPDATE profiles SET loyalty_tier = (
            SELECT tier_name FROM loyalty_tiers
            WHERE NEW.total_earned_points >= min_points 
              AND (max_points IS NULL OR NEW.total_earned_points <= max_points)
              AND is_active = true
            ORDER BY min_points DESC LIMIT 1
        )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1+1 / 2+1 행사 할인 계산
CREATE OR REPLACE FUNCTION apply_promotion_discount(p_product_id UUID, p_store_id UUID, p_quantity INTEGER, p_unit_price NUMERIC)
RETURNS TABLE(original_price NUMERIC, discount_amount NUMERIC, final_price NUMERIC, promotion_type TEXT, promotion_name TEXT) AS $$
DECLARE
    v_promo RECORD;
BEGIN
    SELECT p.name, p.promotion_type INTO v_promo
    FROM promotions p JOIN promotion_products pp ON p.id = pp.promotion_id
    WHERE pp.product_id = p_product_id AND p.is_active = true AND NOW() BETWEEN p.start_date AND p.end_date
      AND (pp.store_id IS NULL OR pp.store_id = p_store_id)
    ORDER BY pp.store_id DESC LIMIT 1;

    IF v_promo.name IS NULL THEN
        RETURN QUERY SELECT p_unit_price * p_quantity, 0::NUMERIC, p_unit_price * p_quantity, NULL::TEXT, NULL::TEXT;
    ELSE
        IF v_promo.promotion_type = 'buy_one_get_one' AND p_quantity >= 2 THEN
            original_price := p_unit_price * p_quantity;
            final_price := p_unit_price * CEIL(p_quantity::NUMERIC / 2);
            discount_amount := original_price - final_price;
        ELSIF v_promo.promotion_type = 'buy_two_get_one' AND p_quantity >= 3 THEN
            original_price := p_unit_price * p_quantity;
            final_price := p_unit_price * (p_quantity - FLOOR(p_quantity::NUMERIC / 3));
            discount_amount := original_price - final_price;
        ELSE
            original_price := p_unit_price * p_quantity;
            final_price := original_price;
            discount_amount := 0;
        END IF;
        RETURN QUERY SELECT original_price, discount_amount, final_price, v_promo.promotion_type, v_promo.name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. 분석용 뷰 및 함수

-- 일별 매출 요약 뷰
CREATE OR REPLACE VIEW daily_sales_analytics AS
SELECT DATE(created_at) as sale_date, COUNT(*) as total_orders, 
       SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
FROM orders GROUP BY sale_date ORDER BY sale_date DESC;

-- 5. 스토리지 및 상품 이미지 연동

-- 스토리지 버킷 생성 정책
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- 상품 이미지 URL 생성
CREATE OR REPLACE FUNCTION get_product_image_urls(product_uuid UUID)
RETURNS TEXT[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT 'https://your-project.supabase.co/storage/v1/object/public/product-images/' || storage_path
        FROM product_images WHERE product_id = product_uuid ORDER BY display_order ASC
    );
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 설정

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER set_supply_request_number_trigger BEFORE INSERT ON supply_requests FOR EACH ROW EXECUTE FUNCTION generate_supply_request_number();
CREATE TRIGGER trigger_generate_return_request_number BEFORE INSERT ON return_requests FOR EACH ROW EXECUTE FUNCTION generate_return_request_number();
CREATE TRIGGER trigger_initialize_store_products AFTER INSERT ON stores FOR EACH ROW EXECUTE FUNCTION initialize_store_products();
CREATE TRIGGER trigger_order_completion AFTER UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION handle_order_completion();
CREATE TRIGGER trigger_handle_return_request_approval AFTER UPDATE ON return_requests FOR EACH ROW EXECUTE FUNCTION handle_return_request_approval();
CREATE TRIGGER update_loyalty_tier_on_points_change AFTER UPDATE OF total_earned_points ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_update_loyalty_tier();

-- 7. RLS 정책 (Detailed)

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Categories & Products
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Only HQ can manage products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'headquarters'));

-- Stores
CREATE POLICY "Anyone can view active stores" ON stores FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage own store" ON stores FOR ALL USING (owner_id = auth.uid());

-- Orders
CREATE POLICY "Customers can manage own orders" ON orders FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Owners can manage store orders" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM stores WHERE id = orders.store_id AND owner_id = auth.uid()));

-- Storage Policies
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "HQ can manage product images" ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'headquarters'));
