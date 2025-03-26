const { callGroqAPI } = require("./groqService");
const { sendMail } = require("./mailService");

const customer1 = {
  id: "KH001",
  name: "Nguyễn Văn A",
  phone: "0123456789",
  product: "Lúa",
  address: "123 Đường ABC, TP.HCM",
};

const customer2 = {
  id: "KH002",
  name: "Trần Thị B",
  phone: "0987654321",
  product: "Lúa",
  address: "456 Đường XYZ, Hà Nội",
};

const convertToHTML = (title, text, customer = 1) => {
  let { id, name, phone, product, address } =
    customer === 1 ? customer1 : customer2;

  const customerHTML = `
      <div style="border: 1px solid #ccc; padding: 12px; border-radius: 8px; background-color: #f9f9f9; margin-bottom: 20px;">
        <p><strong>Mã khách hàng:</strong> ${id || ""}</p>
        <p><strong>Họ Tên:</strong> ${name || ""}</p>
        <p><strong>Số điện thoại:</strong> ${phone || ""}</p>
        <p><strong>Sản phẩm:</strong> ${product || ""}</p>
        <p><strong>Địa chỉ:</strong> ${address || ""}</p>
      </div>
    `;

  const paragraphs = text.split("\n\n").map((p) => {
    if (/^\d+\./.test(p)) {
      const items = p
        .split("\n")
        .map((line) => `<li>${line.replace(/^\d+\.\s*/, "")}</li>`)
        .join("");
      return `<ul>${items}</ul>`;
    }
    return `<p>${p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
  });

  return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: green;">🌾 THÔNG TIN GỬI TỰ ĐỘNG TỪ BOT</h2>
        
        <div style="color: red; font-weight: bold; font-size: 16px; margin-bottom: 16px;">
          ⚠️ Lý do gửi mail: ${title}
        </div>
  
        ${customerHTML}
  
        ${paragraphs.join("\n")}
  
        <p style="margin-top: 30px;">🤖 Đây là email được gửi tự động từ hệ thống quản lý cây trồng.</p>
      </div>
    `;
};

const process = async (title, text, customer) => {
  const result = await callGroqAPI(text);
  const htmlContent = convertToHTML(title, result, customer);
  await sendMail(htmlContent);
  console.log("done flow send mail and chat ai");
};

module.exports = { process };
