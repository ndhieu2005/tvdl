import { Link } from 'react-router-dom';

function MapsFillIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.63 19.04" fill="currentColor" className={className}>
      <path d="m7.31,0C3.27,0,0,3.27,0,7.31c0,4.94,4.04,9.33,6.11,11.27.67.63,1.72.62,2.38-.02,2.07-1.99,6.14-6.5,6.14-11.24C14.63,3.27,11.35,0,7.31,0Zm0,10.38c-1.69,0-3.07-1.37-3.07-3.07s1.37-3.07,3.07-3.07,3.07,1.37,3.07,3.07-1.37,3.07-3.07,3.07Z" />
    </svg>
  );
}

function MailIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19.43 14.76" fill="currentColor" className={className}>
      <path d="m18.7,13.35c-1.37-1.27-4.12-3.77-6.62-5.73-.16-.12-.16-.36,0-.49,2.5-1.96,5.25-4.46,6.62-5.73.19-.17.5-.06.52.2.28,2.92.28,8.63,0,11.55-.02.26-.33.37-.52.2Zm-.41-12.41c-1.7,1.58-5.58,5.09-8.4,7.06-.11.07-.25.07-.35,0C6.72,6.03,2.85,2.52,1.14.94c-.19-.18-.09-.5.17-.53,1.73-.25,4.84-.41,8.41-.41s6.68.16,8.41.41c.26.04.36.36.17.53ZM.21,13.16c-.28-2.92-.28-8.63,0-11.55.02-.26.33-.37.52-.2,1.37,1.27,4.12,3.77,6.62,5.73.16.12.16.36,0,.49-2.49,1.96-5.25,4.46-6.62,5.73-.19.18-.5.06-.52-.2Zm.93.66c1.41-1.31,4.29-3.93,6.84-5.91.11-.09.26-.09.38,0,.41.31.81.59,1.19.84h0c.1.07.24.07.35,0h0c.38-.25.77-.54,1.19-.84.11-.08.27-.08.38,0,2.55,1.97,5.43,4.6,6.84,5.91.19.18.09.5-.17.53-1.73.25-4.84.41-8.41.41s-6.68-.16-8.41-.41c-.26-.04-.36-.36-.17-.53Z" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16.27 16.27" fill="currentColor" className={className}>
      <path d="m16.27,10.15v3.13c0,1.64-1.32,2.98-2.96,2.98-.01,0-.02,0-.03,0-1.13,0-2.24-.14-3.29-.41C5.3,14.66,1.61,10.97.41,6.28c-.27-1.05-.41-2.15-.41-3.29,0-.01,0-.02,0-.03C0,1.32,1.35,0,2.98,0h3.13c.77,0,1.4.63,1.4,1.4v3.48c0,.77-.63,1.4-1.4,1.4h-1.05c.9,2.24,2.68,4.03,4.92,4.92v-1.05c0-.77.63-1.4,1.4-1.4h3.48c.77,0,1.4.63,1.4,1.4Z" />
    </svg>
  );
}

function MessageIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18.36 15.52" fill="currentColor" className={className}>
      <path d="m16.03,12.93c1.45-1.37,2.33-3.18,2.33-5.17C18.36,3.47,14.25,0,9.18,0S0,3.47,0,7.76s4.11,7.76,9.18,7.76c1.62,0,3.14-.35,4.46-.98l2.35.74c.33.1.65-.2.55-.54l-.51-1.82Zm-11.18-3.77c-.77,0-1.39-.62-1.39-1.39s.62-1.39,1.39-1.39,1.39.62,1.39,1.39-.62,1.39-1.39,1.39Zm4.33,0c-.77,0-1.39-.62-1.39-1.39s.62-1.39,1.39-1.39,1.39.62,1.39,1.39-.62,1.39-1.39,1.39Zm4.33,0c-.77,0-1.39-.62-1.39-1.39s.62-1.39,1.39-1.39,1.39.62,1.39,1.39-.62,1.39-1.39,1.39Z" />
    </svg>
  );
}

const inputClass = [
  'w-full border-b border-[#5a76b4] bg-transparent pb-[3px] text-sm mt-1.5',
  'focus:outline-none focus:border-white',
  '[&:-webkit-autofill]:![box-shadow:0_0_0_1000px_#1B3F8B_inset]',
  '[&:-webkit-autofill]:![-webkit-text-fill-color:white]',
  '[&:-webkit-autofill]:![border-color:#5a76b4]',
  '[&:-webkit-autofill:focus]:![border-color:white]',
].join(' ');

export default function ContactPage() {
  const contactInfo = [
    { icon: MapsFillIcon, text: 'Cơ sở 1: 18/56 Đường Thống Nhất, Thôn Thống Nhất, Dương Hoà, Hà Nội.' },
    { icon: MapsFillIcon, text: 'Cơ sở 2: 28 Đường Thanh Niên, Thôn Me Táo, Dương Hoà, Hà Nội.' },
    { icon: MailIcon, text: 'thuvienduonglieu@gmail.com' },
    { icon: PhoneIcon, text: '0906-1515-66' },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-6 sm:gap-20 py-5 sm:py-32 px-5 sm:px-12 lg:px-20 xl:px-40 2xl:px-64">
      {/* Left: contact info */}
      <div className="sm:w-[325px] text-blue">
        <div className="hidden sm:block">
          <p className="text-6xl font-medium">Liên hệ,</p>
          <p className="text-6xl font-medium mt-4">góp ý cho</p>
          <p className="text-6xl font-medium mt-4">Thư viện</p>
          <p className="text-6xl font-medium mt-4">Dương Liễu</p>
        </div>
        <p className="block sm:hidden text-2xl font-bold py-3">
          Liên hệ, góp ý cho<br />Thư viện Dương Liễu
        </p>

        <div className="hidden sm:block border-b-[6px] border-blue my-[45px]" />

        {contactInfo.map(({ icon: Icon, text }) => (
          <div className="flex items-start gap-4 mt-3" key={text}>
            <Icon className="w-3 pt-1.5 shrink-0" />
            <p className="text-sm font-light">{text}</p>
          </div>
        ))}

        <div className="flex items-start gap-4 mt-3">
          <MessageIcon className="w-3 pt-1.5 shrink-0" />
          <p className="text-sm font-light">
            Thông tin chung:
            <a
              href="https://linktr.ee/duonglieu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium ml-1"
            >
              linktr.ee/duonglieu
            </a>
          </p>
        </div>
      </div>

      {/* Right: contact form */}
      <div className="flex-1 bg-blue px-5 sm:px-16 py-5 sm:py-10">
        <p className="text-white text-xl sm:text-4xl font-medium mb-8">
          Gửi tin nhắn cho chúng tôi:
        </p>
        <form className="space-y-6 text-white">
          <div>
            <label htmlFor="name" className="text-xs font-extralight">Họ và tên:</label>
            <input id="name" name="name" type="text" className={inputClass} />
          </div>

          <div className="flex flex-col md:flex-row gap-6 sm:gap-16">
            <div className="flex-1">
              <label htmlFor="email" className="text-xs font-extralight">Địa chỉ email:</label>
              <input id="email" name="email" type="email" className={inputClass} />
            </div>
            <div className="flex-1">
              <label htmlFor="phone" className="text-xs font-extralight">Số điện thoại:</label>
              <input id="phone" name="phone" type="tel" className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="text-xs font-extralight">Tiêu đề:</label>
            <input id="subject" name="subject" type="text" className={inputClass} />
          </div>

          <div>
            <label htmlFor="message" className="text-xs font-extralight">Lời nhắn:</label>
            <textarea
              id="message"
              name="message"
              rows={3}
              className="w-full bg-white focus:outline-none p-2 resize-none text-black mt-1.5"
            />
          </div>

          <button
            type="submit"
            className="w-full text-sm sm:text-base border-2 border-yellow bg-yellow hover:bg-blue font-extralight px-10 py-3 rounded-full duration-200"
          >
            GỬI TIN NHẮN
          </button>
        </form>
      </div>
    </div>
  );
}
