/**
 * RABBITLIE CRM - BẢN CẬP NHẬT TỰ ĐỘNG THÊM CỘT "HỌ VÀ TÊN"
 * 
 * ID Sheet của bạn: 1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs
 */

// Hàm chạy thử để tạo ngay cột "Họ và tên" trong Sheet của bạn
function setupSheetHeader() {
  var ss = SpreadsheetApp.openById("1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs");
  var sheet = ss.getSheets()[0];
  
  if (sheet.getRange(1, 2).getValue() !== "Họ và tên") {
    sheet.insertColumnAfter(1); // Chèn cột mới vào vị trí B
    sheet.getRange(1, 2).setValue("Họ và tên").setFontWeight("bold");
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById("1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs");
    var sheet = ss.getSheets()[0];
    
    // Tự động kiểm tra: nếu ô B1 chưa có cột "Họ và tên" thì tự chèn vào
    if (sheet.getRange(1, 2).getValue() !== "Họ và tên") {
      sheet.insertColumnAfter(1);
      sheet.getRange(1, 2).setValue("Họ và tên").setFontWeight("bold");
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");
    var name = (data.name || "").toString().trim();
    var email = (data.email || "").toString().trim();
    var phone = "'" + (data.phone || "").toString().trim(); // Giữ số 0 đầu
    var voucher = data.voucherCode || "BADBUNNY20";
    
    // Ghi 1 dòng mới vào Sheet đủ 5 cột: Thời gian, Họ và tên, Email, Số điện thoại, Mã Voucher
    sheet.appendRow([timestamp, name, email, phone, voucher]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
