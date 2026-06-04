import React from "react";
import Link from "next/link";
import Image from "next/image";
import bgAboutLibrary from "./assets/bg_about_library.svg";
import { ShortArrowRightIcon } from "@/components/ui/icons/ShortArrowRightIcon";
import clsx from "clsx";

export default function AboutPage() {
  const contents = [
    "Thư viện Dương Liễu là thư viện tư nhân có phục vụ cộng đồng đầu tiên tại xã Dương Liễu (nay là xã Dương Hoà), TP. Hà Nội. Được thành lập vào tháng 9 năm 2013, với mong muốn xây dựng một không gian văn hoá đọc, thân thiện và gần gũi dành cho trẻ em và người dân trong khu vực. Khởi nguồn từ tâm huyết của những người trẻ yêu sách, thư viện đã dần trở thành điểm hẹn quen thuộc của thiếu nhi, thanh thiếu niên, phụ huynh và người dân trong vùng. Trải qua hơn một thập kỷ phát triển, thư viện hiện sở hữu hơn 15.000 đầu sách đa dạng, bao gồm sách thiếu nhi, văn học, kỹ năng sống, tài liệu học tập và nhiều nguồn tri thức bổ ích khác, đáp ứng nhu cầu đọc và học tập của nhiều lứa tuổi.",
    "Không chỉ là nơi để đọc sách, Thư viện Dương Liễu còn cung cấp nhiều chương trình, hoạt động đa dạng, giúp người đọc có thêm nhiều lựa chọn khi ghé thăm. Nhiều chương trình đã được triển khai như: Pokemon Read, Book Challenge, Library Tour, Tập làm nhà phát minh, Library Talk, Gói bánh chưng, Gói bánh trung thu, các buổi nói chuyện hướng nghiệp cũng như các workshop dành cho các em học sinh cấp 1, cấp 2. Các lớp học cũng được Thư viện Dương Liễu chú trọng và tổ chức, một số lớp học tiêu biểu như: lớp học tiếng Anh, tiếng Pháp, Em tập code, các lớp học kỹ năng mềm... Các hoạt động và sự kiện này đã tạo ra nhiều cơ hội để bạn đọc được phát triển toàn diện, giúp tăng sự gắn kết trong cộng đồng và các gia đình.",
    "Không chỉ thế, hiện Thư viện Dương Liễu có nhiều dự án, CLB nhằm hướng tới việc cung cấp các dịch vụ thông tin khác nhau cho các nhóm đối tượng khác nhau. Có thể kể đến dự án WeHere - giúp nâng cao sức khoẻ tinh thần; dự án WeTalk - tập trung về truyền thông văn hoá; dự án WeTech - ứng dụng công nghệ để nâng cao chất lượng dịch vụ trong thư viện; dự án WeJoy - giáo dục thông qua các hoạt động nghệ thuật sáng tạo; dự án WeDesign - dành cho các bạn yêu thích thiết kế đồ hoạ; CLB Sách 52 - khuyến khích việc đọc sách và chia sẻ kiến thức thông qua việc đọc sách.",
    "Với mô hình tự quản, Thư viện Dương Liễu hoạt động dựa trên sự chung tay, đóng góp của cộng đồng và đội ngũ gần 100 tình nguyện viên nhiệt huyết. Chính sự đồng hành này đã giúp thư viện trở thành một không gian văn hóa – giáo dục, nơi tinh thần đọc, học tập suốt đời trở thành kim chỉ nam.",
    "Trong thời gian tới, Thư viện Dương Liễu sẽ tiếp tục mở rộng các chương trình và dịch vụ thông tin, đồng thời phát triển nhiều sáng kiến mới giúp người dân tiếp cận tri thức đa dạng và thuận tiện hơn. Thư viện đặt mục tiêu trở thành một mô hình tiên phong, sáng tạo và đổi mới, biết tận dụng nguồn lực địa phương kết hợp với ứng dụng công nghệ để nâng cao hiệu quả hoạt động.",
  ];
  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-center p-4 sm:p-16">
        <p className="text-primary-blue text-xl sm:text-5xl font-semibold">
          Về Thư viện
        </p>
        <Link
          href="/contact"
          className="bg-primary-blue hover:bg-primary-yellow text-white duration-200 w-52 sm:w-80 h-8 sm:h-12 pl-3 sm:pl-10 flex items-center gap-2 sm:gap-8"
        >
          <ShortArrowRightIcon className="h-2 sm:h-3 w-auto" />
          <p className="font-extralight text-xs sm:text-sm">
            Liên hệ Thư viện Dương Liễu
          </p>
        </Link>
      </div>

      <Image src={bgAboutLibrary} alt="bgAboutLibrary" className="w-full" />

      <div className="p-6 sm:p-16">
        <p className="text-primary-blue text-3xl sm:text-5xl font-bold mb-5 sm:mb-14">
          WE DO LIBRARY & BEYOND
        </p>
        {contents.map((text, index) => (
          <p
            key={index}
            className={clsx(
              "text-sm sm:text-base font-light sm:font-normal text-dark-grey text-justify",
              {
                "mt-5": index !== 0,
              }
            )}
          >
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
