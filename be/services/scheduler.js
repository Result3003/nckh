const cron = require("node-cron");
const { postToFacebook } = require("./facebookService");
const { DateTime } = require("luxon");

// Chạy cron mỗi phút, kiểm tra nếu đúng 11h sáng theo VN thì post
cron.schedule("* * * * *", () => {
  const nowVN = DateTime.now().setZone("Asia/Ho_Chi_Minh");
  const hour = nowVN.hour;
  const minute = nowVN.minute;

  if (hour === 11 && minute === 0) {
    console.log(
      `🕚 Đang đăng bài lúc 11h sáng VN (${nowVN.toFormat("HH:mm")})`
    );
    postToFacebook();
  } else {
    console.log(`⏱️ Bỏ qua, hiện tại ở VN là: ${nowVN.toFormat("HH:mm")}`);
  }
});
