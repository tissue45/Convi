import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase/client';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useAuthStore } from '../../stores/common/authStore';

interface ReturnRequest {
  id: string;
  request_number: string;
  status: string;
  priority: string;
  total_amount: number;
  approved_amount: number | null;
  return_reason: string;
  additional_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  created_at: string;
  updated_at: string;
  items?: ReturnRequestItem[];
  approver?: {
    full_name: string;
  };
}

interface ReturnRequestItem {
  id: string;
  product_name: string;
  requested_quantity: number;
  approved_quantity: number | null;
  unit_cost: number;
  total_cost: number;
  condition_notes: string | null;
  current_stock: number;
}

interface ReturnRequestListProps {
  refreshTrigger: number;
}

const STATUS_LABELS = {
  submitted: '제출됨',
  approved: '승인됨',
  rejected: '거부됨',
  processing: '처리중',
  completed: '완료됨',
  cancelled: '취소됨'
};

const STATUS_COLORS = {
  submitted: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const PRIORITY_LABELS = {
  low: '낮음',
  normal: '보통',
  high: '높음',
  urgent: '긴급'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-teal-100 text-teal-800',
  urgent: 'bg-red-100 text-red-800'
};

const ReturnRequestList: React.FC<ReturnRequestListProps> = ({ refreshTrigger }) => {
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ReturnRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [requestToCancel, setRequestToCancel] = useState<ReturnRequest | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const { user } = useAuthStore();

  const fetchReturnRequests = useCallback(async () => {
    try {
      setLoading(true);
      
      // 현재 사용자의 지점 ID 조회
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user?.id || '')
        .single();

      if (storeError || !storeData) {
        console.error('❌ 지점 정보 조회 실패:', storeError);
        return;
      }

      let query = supabase
        .from('return_requests')
        .select(`
          *,
          approver:profiles!return_requests_approved_by_fkey(full_name),
          items:return_request_items(*)
        `)
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data: returnRequestsData, error: returnRequestsError } = await query;

      if (returnRequestsError) {
        console.error('❌ 반품 요청 조회 실패:', returnRequestsError);
        return;
      }

      setReturnRequests(returnRequestsData || []);
    } catch (error) {
      console.error('❌ 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filterStatus]);

  useEffect(() => {
    fetchReturnRequests();
  }, [fetchReturnRequests, refreshTrigger]);

  // 실시간 구독 설정
  useEffect(() => {
    const subscription = supabase
      .channel('return_requests_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'return_requests' }, 
        (payload) => {
          console.log('🔄 반품 요청 데이터 변경 감지:', payload);
          fetchReturnRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchReturnRequests]);

  const openDetailModal = (request: ReturnRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedRequest(null);
    setShowDetailModal(false);
  };

  const handleCancelRequest = (request: ReturnRequest) => {
    // 취소 가능한 상태인지 확인 (제출됨 상태만 허용)
    if (request.status !== 'submitted') {
      alert('취소할 수 없는 상태입니다. 제출됨 상태에서만 취소가 가능합니다. 현재 상태: ' + STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]);
      return;
    }
    
    setRequestToCancel(request);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!requestToCancel || !user?.id) {
      alert('사용자 정보가 없습니다.');
      return;
    }

    try {
      setCancelling(true);

      // 데이터베이스 함수 호출
      const { data, error } = await supabase.rpc('cancel_return_request', {
        request_id: requestToCancel.id,
        cancelled_by_user_id: user.id,
        cancel_reason: cancelReason.trim() || null
      });

      if (error) {
        console.error('❌ 반품 요청 취소 실패:', error);
        alert('반품 요청 취소에 실패했습니다: ' + error.message);
        return;
      }

      if (data && !data.success) {
        alert('반품 요청 취소에 실패했습니다: ' + data.error);
        return;
      }

      alert(data?.message || '반품 요청이 성공적으로 취소되었습니다.');
      
      // 모달 닫기 및 데이터 새로고침
      setShowCancelModal(false);
      setRequestToCancel(null);
      setCancelReason('');
      fetchReturnRequests();
      
    } catch (error) {
      console.error('❌ 반품 요청 취소 중 오류:', error);
      alert('반품 요청 취소 중 오류가 발생했습니다.');
    } finally {
      setCancelling(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setRequestToCancel(null);
    setCancelReason('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 필터 */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">반품 요청 내역</h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="submitted">제출됨</option>
            <option value="approved">승인됨</option>
            <option value="rejected">거부됨</option>
            <option value="processing">처리중</option>
            <option value="completed">완료됨</option>
            <option value="cancelled">취소됨</option>
          </select>
        </div>

        {/* 반품 요청 목록 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {returnRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              반품 요청 내역이 없습니다.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {returnRequests.map((request) => (
                <li key={request.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {request.request_number}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS]}`}>
                              {PRIORITY_LABELS[request.priority as keyof typeof PRIORITY_LABELS]}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}`}>
                              {STATUS_LABELS[request.status as keyof typeof STATUS_LABELS]}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">반품 사유:</span> {request.return_reason}
                              </p>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">신청 금액:</span> {request.total_amount.toLocaleString()}원
                                {request.approved_amount && request.approved_amount !== request.total_amount && (
                                  <span className="ml-2">
                                    / <span className="font-medium">승인 금액:</span> {request.approved_amount.toLocaleString()}원
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium">신청일:</span> {new Date(request.created_at).toLocaleDateString('ko-KR')}
                                {request.approved_at && (
                                  <span className="ml-2">
                                    / <span className="font-medium">처리일:</span> {new Date(request.approved_at).toLocaleDateString('ko-KR')}
                                  </span>
                                )}
                              </p>
                              {request.items && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">상품 수:</span> {request.items.length}개 상품
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => openDetailModal(request)}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                              >
                                상세보기
                              </button>
                              {request.status === 'submitted' && (
                                <button
                                  onClick={() => handleCancelRequest(request)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                  title="반품 요청 취소"
                                >
                                  취소
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        {request.rejected_reason && (
                          <div className="mt-2 p-2 bg-red-50 rounded">
                            <p className="text-sm text-red-700">
                              <span className="font-medium">거부 사유:</span> {request.rejected_reason}
                            </p>
                          </div>
                        )}
                        {request.additional_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">추가 메모:</span> {request.additional_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  반품 요청 상세정보 - {selectedRequest.request_number}
                </h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="p-6 space-y-6">
                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">기본 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">상태:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[selectedRequest.status as keyof typeof STATUS_COLORS]}`}>
                          {STATUS_LABELS[selectedRequest.status as keyof typeof STATUS_LABELS]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">우선순위:</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${PRIORITY_COLORS[selectedRequest.priority as keyof typeof PRIORITY_COLORS]}`}>
                          {PRIORITY_LABELS[selectedRequest.priority as keyof typeof PRIORITY_LABELS]}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">반품 사유:</span>
                        <span>{selectedRequest.return_reason}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">신청 금액:</span>
                        <span className="font-bold">{selectedRequest.total_amount.toLocaleString()}원</span>
                      </div>
                      {selectedRequest.approved_amount && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">승인 금액:</span>
                          <span className="font-bold text-green-600">{selectedRequest.approved_amount.toLocaleString()}원</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">처리 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">신청일:</span>
                        <span>{new Date(selectedRequest.created_at).toLocaleString('ko-KR')}</span>
                      </div>
                      {selectedRequest.approved_at && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">처리일:</span>
                          <span>{new Date(selectedRequest.approved_at).toLocaleString('ko-KR')}</span>
                        </div>
                      )}
                      {selectedRequest.approver && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">처리자:</span>
                          <span>{selectedRequest.approver.full_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 추가 메모 */}
                {selectedRequest.additional_notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">추가 메모</h3>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedRequest.additional_notes}</p>
                    </div>
                  </div>
                )}

                {/* 거부 사유 */}
                {selectedRequest.rejected_reason && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">거부 사유</h3>
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">{selectedRequest.rejected_reason}</p>
                    </div>
                  </div>
                )}

                {/* 반품 상품 목록 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">반품 상품 목록</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상품명
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            신청 수량
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            승인 수량
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            단가
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            금액
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            상품 상태
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRequest.items?.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.product_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.requested_quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.approved_quantity || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.unit_cost.toLocaleString()}원
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.total_cost.toLocaleString()}원
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.condition_notes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50">
              <div className="flex justify-between">
                <div>
                  {selectedRequest.status === 'submitted' && (
                    <button
                      onClick={() => {
                        closeDetailModal();
                        handleCancelRequest(selectedRequest);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      반품 요청 취소
                    </button>
                  )}
                </div>
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 취소 확인 모달 */}
      {showCancelModal && requestToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 rounded-full p-3 mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">반품 요청 취소</h3>
                  <p className="text-sm text-gray-500">
                    {requestToCancel.request_number}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-3">
                  이 반품 요청을 취소하시겠습니까?
                  <span className="block mt-1 text-gray-600 text-xs">
                    💡 제출됨 상태에서만 취소가 가능합니다.
                  </span>
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    취소 사유 (선택사항)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="취소 사유를 입력해주세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeCancelModal}
                  disabled={cancelling}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {cancelling && <LoadingSpinner />}
                  {cancelling ? '처리 중...' : '반품 요청 취소'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReturnRequestList;
