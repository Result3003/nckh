let userData = [];

function toggleForm() {
  const form = document.getElementById("userForm");
  const button = document.getElementById("toggleFormButton");
  form.style.display = form.style.display === "none" ? "block" : "none";
  button.textContent =
    form.style.display === "block" ? "Xong" : "Thêm Người Dùng";
}

function addUser() {
  const newUser = {
    customerId: getValue("customerId"),
    name: getValue("name"),
    phone: getValue("phone"),
    product: getValue("product"),
    address: getValue("address"),
    packageInfo: getValue("package"),
    status: getValue("status"),
  };

  if (Object.values(newUser).some((v) => v === "")) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  userData.push(newUser);
  renderTable();
  saveToLocal();
  resetForm();
  alert("✅ Đã lưu người dùng!");
}

function deleteUser(index) {
  const confirmDelete = confirm("Bạn có chắc chắn muốn xoá người dùng này?");
  if (!confirmDelete) return;

  userData.splice(index, 1);
  renderTable();
  saveToLocal();
}

function getValue(id) {
  return document.getElementById(id).value.trim();
}

function resetForm() {
  [
    "customerId",
    "name",
    "phone",
    "product",
    "address",
    "package",
    "status",
  ].forEach((id) => {
    document.getElementById(id).value = "";
  });
}

function renderTable() {
  const table = document.getElementById("userTable");
  table.innerHTML = "";
  userData.forEach((user, index) => {
    const row = table.insertRow();
    row.innerHTML = `
        <td>${user.customerId}</td>
        <td>${user.name}</td>
        <td>${user.phone}</td>
        <td>${user.product}</td>
        <td>${user.address}</td>
        <td>${user.packageInfo}</td>
        <td>${user.status}</td>
        <td><button class="delete-button" onclick="deleteUser(${index})">🗑️</button></td>
      `;
    row.onclick = () => showDetail(user.customerId);
  });
}

function saveToLocal() {
  localStorage.setItem("userData", JSON.stringify(userData));
}

function loadFromLocal() {
  const data = localStorage.getItem("userData");
  if (data) {
    userData = JSON.parse(data);
    renderTable();
  }
}

window.onload = function () {
  loadFromLocal();
};

function parseParameterString(paramStr) {
  //   console.log(paramStr);
  const parts = paramStr.split(" | ");
  return {
    id: parts[0]?.trim() || "",
    dht11Temp: parts[1]?.split(":")[1]?.trim() || "",
    humidity: parts[2]?.split(":")[1]?.trim() || "",
    soilMoisture: parts[3]?.split(":")[1]?.trim() || "",
    light: parts[4]?.split(":")[1]?.trim() || "",
    pressure: parts[5]?.split(":")[1]?.trim() || "",
  };
}

function showDetail(customerId) {
  fetch(`http://localhost:5000/api/search?id=${customerId}`)
    .then((response) => response.json())
    .then((dataList) => {
      const dialog = document.createElement("div");
      dialog.classList.add("dialog-overlay");

      const recentData = dataList.slice(-10).reverse(); // lấy 10 item mới nhất

      // Nếu cần: cập nhật status
      const user = userData.find((u) => u.customerId === customerId);
      if (user) {
        user.status = dataList.length > 10 ? "Thu hoạch" : "Đang trồng";
        saveToLocal();
        renderTable();
      }

      // 👉 Tách parameter thành mảng object
      const parsedData = recentData.map((item) => {
        return parseParameterString(item.data.parameter);
      });

      // 👉 Dùng parsedData để hiển thị bảng
      const htmlRows = parsedData
        .map(
          (param) => `
          <tr>
            <td>${param.id}</td>
            <td>${param.dht11Temp}</td>
            <td>${param.humidity}</td>
            <td>${param.soilMoisture}</td>
            <td>${param.light}</td>
            <td>${param.pressure}</td>
          </tr>
        `
        )
        .join("");

      dialog.innerHTML = `
          <div class="dialog-box">
            <h3>Thông số cảm biến - ID: ${customerId}</h3>
            <button class="close-dialog" onclick="this.closest('.dialog-overlay').remove()">Đóng</button>
            <div class="dialog-content">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nhiệt độ DHT11</th>
                    <th>Độ ẩm không khí</th>
                    <th>Độ ẩm đất</th>
                    <th>Ánh sáng</th>
                    <th>Áp suất</th>
                  </tr>
                </thead>
                <tbody>${htmlRows}</tbody>
              </table>
            </div>
          </div>
        `;

      document.body.appendChild(dialog);
    })
    .catch((error) => {
      alert("Không thể tải dữ liệu: " + error.message);
    });
}
