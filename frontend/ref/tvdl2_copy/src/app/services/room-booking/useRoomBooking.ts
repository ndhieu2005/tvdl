import { useState } from 'react';
import { RoomType } from './const';
import { useRouter } from 'next/navigation';
import { useRecaptchaV3 } from '@/components/RecaptchaV3';

const VOLUNTEER_CARD_NUMBER_MAX_VALUE = 300;
const INIT_FORM_DATA = {
  fullName: '',
  phone: '',
  email: '',
  cardNumber: '',
  roomType: RoomType.CS1,
  bookingDate: '',
  startTime: '',
  endTime: '',
  numberOfPeople: '',
  note: '',
  agreeTerms: false
};

const useRoomBooking = () => {
  const { executeRecaptcha } = useRecaptchaV3();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState(INIT_FORM_DATA);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.email.trim()) {
      errors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.cardNumber.trim()) {
      errors.cardNumber = 'Vui lòng nhập số thẻ thư viện';
    } else if (formData.cardNumber.split('-').length < 2) {
      errors.cardNumber = 'Số thẻ thư viện không hợp lệ. Định dạng đúng: M - XXXXXX';
    }  else if (Number(formData.cardNumber.split('-')[1]) > VOLUNTEER_CARD_NUMBER_MAX_VALUE) {
      errors.cardNumber = 'Tính năng mượn phòng tạm thời chỉ áp dụng cho tình nguyện viên của Thư viện';
    }

    if (!formData.numberOfPeople.trim()) {
      errors.numberOfPeople = 'Vui lòng nhập số người';
    }

    if (!formData.bookingDate) {
      errors.bookingDate = 'Vui lòng chọn ngày đặt phòng';
    }

    if (!formData.startTime || !formData.endTime) {
      errors.startTime = 'Vui lòng chọn khung giờ';
    }

    if (!formData.note.trim()) {
      errors.note = 'Vui lòng nhập mục đích sử dụng';
    }

    if (!formData.agreeTerms) {
      errors.agreeTerms = 'Vui lòng đọc và đồng ý với điều khoản sử dụng';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Thực hiện reCAPTCHA v3 trước khi submit
      let recaptchaToken = null;
      if (process.env.NODE_ENV === 'production') {
        recaptchaToken = await executeRecaptcha('room_booking');
        if (!recaptchaToken) {
          alert('Không thể xác minh reCAPTCHA. Vui lòng thử lại.');
          setIsSubmitting(false);
          return;
        }
      } else {
        recaptchaToken = 'dev-bypass';
      }

      const response = await fetch('/api/services/room-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken
        }),
      });

      const result = await response.json();
      console.log('--- result submit room booking :>> ', result);
      if (result.success) {
        setFormData(INIT_FORM_DATA);
        router.push('/services/room-booking/success');
      } else {
        alert(result.error || 'Có lỗi xảy ra khi gửi đăng ký');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra khi gửi đăng ký');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDateCanBorrow = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDateCanBorrow = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };


  return {
    formData,
    isSubmitting,
    validationErrors,
    handleInputChange,
    handleSubmit,
    getMinDateCanBorrow,
    getMaxDateCanBorrow
  }
};

export default useRoomBooking;
