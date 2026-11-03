/**
 * RABBITLIE CRM - BẢN ĐƠN GIẢN NHẤT (CHỈ THU THẬP DỮ LIỆU)
 * Không biểu đồ, không công thức phức tạp, đảm bảo lưu thông tin 100%.
 */

function doPost(e) {
  try {
    // 1. Mở file Google Sheet theo đúng ID của bạn
    var ss = SpreadsheetApp.openById("1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs");
    var sheet = ss.getSheets()[0]; // Tự động ghi vào trang tính đầu tiên
    
    // 2. Tạo tiêu đề cột nếu sheet còn trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian", "Email", "Số điện thoại", "Mã Voucher"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
    }
    
    // 3. Đọc dữ liệu gửi từ website
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var email = data.email || "";
    var phone = "'" + (data.phone || ""); // Thêm dấu ' để giữ nguyên số 0 ở đầu
    var voucher = data.voucherCode || "BADBUNNY20";
    
    // 4. Ghi 1 dòng mới vào Sheet
    sheet.appendRow([timestamp, email, phone, voucher]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
