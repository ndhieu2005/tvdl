import { Link } from 'react-router-dom';

const SERVICES = [
  { text: 'Tra cứu\ntài liệu', href: 'https://skoolib.net/li/tvdlcs1/opac-public' },
  { text: 'Sách mới', to: '/new-books' },
  { text: 'Đề xuất\nsách', to: '/suggest' },
];

function ShortArrowRightIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12.69 8.88" fill="currentColor" className={className}>
      <path d="m12.69,4.48c0-.1-.02-.21-.12-.3-.17-.17-.33-.34-.5-.5-1.17-1.19-2.33-2.37-3.5-3.56-.37-.38-.95.2-.58.58.17.17.33.34.5.5.94.95,1.87,1.9,2.81,2.85H.4c-.53,0-.53.82,0,.82h10.88c-1.11,1.1-2.23,2.2-3.35,3.3-.38.37.2.95.58.58.17-.17.34-.34.51-.51,1.18-1.17,2.36-2.33,3.54-3.49.07-.07.11-.16.11-.25,0-.01,0-.02,0-.03Z"/>
    </svg>
  );
}

export default function ServicesPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-3xl lg:text-5xl font-semibold text-blue text-center sm:text-left px-10 py-20 sm:p-28">
        Dịch vụ thư viện
      </h1>

      <div className="flex-1 flex flex-col sm:flex-row">
        {SERVICES.map((item, index) => {
          const className = `flex-1 flex flex-col items-center text-white py-5 sm:py-14 px-6 duration-150 ${
            index % 2 === 0 ? 'bg-blue hover:opacity-90' : 'bg-yellow hover:opacity-90'
          }`;
          const inner = (
            <>
              <ShortArrowRightIcon className="h-3.5 sm:h-7 w-auto sm:rotate-90" />
              <p className="text-center font-medium text-base sm:text-3xl h-full flex items-center whitespace-pre-line">
                {item.text}
              </p>
            </>
          );
          return item.href ? (
            <a key={item.text} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
              {inner}
            </a>
          ) : (
            <Link key={item.text} to={item.to} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
