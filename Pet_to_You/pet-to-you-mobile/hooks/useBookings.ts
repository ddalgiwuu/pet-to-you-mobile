import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { MOCK_BOOKINGS, getMockBookingsByStatus } from '@/constants/mockData';

export interface Booking {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  petId: string;
  petName: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  symptoms?: string;
  notes?: string;
  createdAt: string;
}

export const useBookings = (status?: 'upcoming' | 'completed' | 'cancelled') => {
  return useQuery({
    queryKey: ['bookings', status],
    queryFn: async () => {
      try {
        const response = await api.getBookings(status);
        return response.data as Booking[];
      } catch (error) {
        console.log('API unavailable, using mock bookings data');
        return status ? getMockBookingsByStatus(status) : MOCK_BOOKINGS;
      }
    },
    staleTime: 2 * 60 * 1000,
    placeholderData: status ? getMockBookingsByStatus(status) : MOCK_BOOKINGS,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await api.cancelBooking(bookingId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useRescheduleBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const response = await api.rescheduleBooking(id, { date, time });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};
