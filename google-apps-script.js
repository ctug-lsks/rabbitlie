/**
 * RABBITLIE CRM - BẢN CẬP NHẬT (THÊM CỘT HỌ VÀ TÊN)
 * Tự động chèn cột "Họ và tên" nếu sheet đang có 4 cột cũ, đảm bảo dữ liệu không bị lệch.
 */

function doPost(e) {
  try {
    // 1. Mở file Google Sheet theo đúng ID của bạn
    var ss = SpreadsheetApp.openById("1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs");
    var sheet = ss.getSheets()[0]; // Tự động ghi vào trang tính đầu tiên
    
    // 2. Tự động chuẩn hóa tiêu đề cột: Thời gian, Họ và tên, Email, Số điện thoại, Mã Voucher
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Thời gian", "Họ và tên", "Email", "Số điện thoại", "Mã Voucher"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    } else if (sheet.getLastColumn() === 4) {
      // Nếu sheet cũ có 4 cột, tự động chèn thêm cột B "Họ và tên" vào giữa Thời gian và Email
      sheet.insertColumnAfter(1);
      sheet.getRange(1, 2).setValue("Họ và tên").setFontWeight("bold");
    }
    
    // 3. Đọc dữ liệu gửi từ website
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var name = (data.name || "").toString().trim();
    var email = (data.email || "").toString().trim();
    var phone = "'" + (data.phone || "").toString().trim(); // Thêm dấu ' để giữ số 0 ở đầu
    var voucher = data.voucherCode || "BADBUNNY20";
    
    // 4. Ghi 1 dòng mới vào Sheet (đủ 5 cột)
    sheet.appendRow([timestamp, name, email, phone, voucher]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
