-- =====================================================
-- seed_data.sql
-- 기초 데이터 삽입 (Categories, Products, Tiers, Settings)
-- 버전: 1.0.0
-- =====================================================

-- 1. 카테고리 데이터
INSERT INTO categories (name, slug, description, display_order) VALUES
('음료', 'beverages', '탄산음료, 커피, 차, 우유 등', 1),
('식품', 'food', '즉석식품, 라면, 냉동식품 등', 2),
('간식', 'snacks', '과자, 초콜릿, 캔디 등', 3),
('생활용품', 'household', '세제, 티슈, 개인위생용품 등', 4)
ON CONFLICT (slug) DO NOTHING;

-- 2. 멤버십 등급 데이터
INSERT INTO loyalty_tiers (tier_name, min_points, max_points, point_earn_rate, tier_color, display_order) VALUES
('Bronze', 0, 999, 1.0, '#CD7F32', 1),
('Silver', 1000, 4999, 1.2, '#C0C0C0', 2),
('Gold', 5000, 19999, 1.5, '#FFD700', 3),
('Platinum', 20000, NULL, 2.0, '#E5E4E2', 4)
ON CONFLICT (tier_name) DO NOTHING;

-- 3. 시스템 설정 데이터
INSERT INTO system_settings (key, value, description, category, is_public) VALUES
('app_name', '"편의점 관리 시스템"', '애플리케이션 이름', 'general', true),
('min_order_amount', '1000', '최소 주문 금액', 'business', true),
('delivery_fee', '2000', '기본 배송비', 'business', true)
ON CONFLICT (key) DO NOTHING;

-- 4. 샘플 상품 데이터
INSERT INTO products (name, barcode, category_id, base_price, unit) VALUES
('코카콜라 500ml', '8801094000001', (SELECT id FROM categories WHERE slug = 'beverages'), 2000, '개'),
('농심 신라면 120g', '8801043001010', (SELECT id FROM categories WHERE slug = 'food'), 1200, '개'),
('농심 새우깡 90g', '8801043011010', (SELECT id FROM categories WHERE slug = 'snacks'), 1500, '개')
ON CONFLICT (barcode) DO NOTHING;

-- 5. 웰컴 쿠폰 데이터
INSERT INTO coupons (code, name, description, discount_type, discount_value, min_order_amount, usage_limit, valid_until) VALUES
('WELCOME10', '신규 가입 축하 쿠폰', '신규 가입을 축하합니다!', 'percentage', 10, 10000, 1, NOW() + INTERVAL '30 days')
ON CONFLICT (code) DO NOTHING;
