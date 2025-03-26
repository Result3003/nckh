const axios = require("axios");

const getPostContent = () => {
  return {
    message:
      "SẢN PHẨM MỚI\nGạo Thơm Lài - An Giang đã có hàng thị trường\nGạo thơm lài với tính chất dẻo vừa, thơm nhẹ và dễ nấu, rất được ưa thích, giá cả phải chăng.\nLink chi tiết: \nĐịa điểm: An Giang.\n✅ Đạt chuẩn chất lượng.\nMọi thắc mắc vui lòng liên hệ Dịch vụ NCHTS, điện thoại: 01231233.\n________________________________\nSTHCN - Sản phẩm nông nghiệp",
  };
};

const postToFacebook = async () => {
  const postData = getPostContent();
  const url = `https://graph.facebook.com/594682717064741/feed`;

  const params = new URLSearchParams();
  params.append("message", postData.message);
  params.append(
    "access_token",
    "EAAGZAAFsj3tUBOwUG7ZA8PP0hxFvgZCVHQMSXKXgsu6MYP68dlnakGZC1N3EKe5OFL1XByZCmvvJXRc0zzlb2V5CIh3EngTNZCYFmcuZCHp0Q0SlP0h16v6whDCDtDM7mQ95z6AAPa4ZBXl50jxhZAtaZCDq6omPwcefRreMDJL2vGuUCAY7OZCFj1ZCesaZCBFtWuW29Fo8ETkAQ2ZCaMaewIdXQPZCbXI"
  );
  params.append("attached_media", [{ media_fbid: "122096133194824349" }]);

  try {
    const response = await axios.post(url, {
      body: params,
    });

    const data = await response.json();

    if (data.id) {
      console.log(
        `[✅ ${new Date().toLocaleString()}] Bài viết đã đăng: ${data.id}`
      );
    } else {
      console.error(
        `[❌ ${new Date().toLocaleString()}] Lỗi khi đăng bài:`,
        data
      );
    }
  } catch (error) {
    console.error(`[❌ ${new Date().toLocaleString()}] Lỗi fetch:`, error);
  }
};

module.exports = { postToFacebook };
