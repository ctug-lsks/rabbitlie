/**
 * RABBITLIE - GOOGLE APPS SCRIPT KẾT NỐI WEBSITE & TẠO BIỂU ĐỒ TỰ ĐỘNG
 * 
 * Hướng dẫn cài đặt:
 * 1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs/edit
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script
 * 3. Xoá hết mã cũ và dán toàn bộ đoạn mã này vào.
 * 4. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment).
 *    - Chọn loại: Ứng dụng web (Web app)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 *    - Bấm Triển khai (Deploy) và copy link Web App URL.
 */

// Tên các trang tính
var LEADS_SHEET_NAME = "Danh Sách Nhận Mã";
var DASHBOARD_SHEET_NAME = "Dashboard & Biểu Đồ";

/**
 * Xử lý nhận dữ liệu POST từ Website RabbitLie khi khách bấm "Nhận voucher 20%"
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LEADS_SHEET_NAME);
    
    // Nếu chưa có sheet Danh Sách, tạo mới
    if (!sheet) {
      sheet = ss.insertSheet(LEADS_SHEET_NAME);
      sheet.appendRow(["Thời gian", "Email", "Số điện thoại", "Mã Voucher", "Trạng thái"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy, HH:mm:ss");
    var email = (data.email || "").toString().trim();
    var phone = (data.phone || "").toString().trim();
    var voucher = data.voucherCode || "BADBUNNY20";
    
    sheet.appendRow([
      timestamp,
      email,
      "'" + phone, // Thêm nháy đơn để Google Sheet giữ nguyên số 0 ở đầu SĐT
      voucher,
      "Chưa sử dụng"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success",
      message: "Đã lưu vào Google Sheet thành công" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý GET để trả về danh sách khách hàng cho trang Admin Website
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LEADS_SHEET_NAME);
    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ leads: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    var leads = [];
    
    for (var i = 1; i < data.length; i++) {
      leads.push({
        timestamp: data[i][0] ? data[i][0].toString() : "",
        email: data[i][1] ? data[i][1].toString() : "",
        phone: data[i][2] ? data[i][2].toString().replace("'", "") : "",
        voucherCode: data[i][3] ? data[i][3].toString() : "",
        status: data[i][4] ? data[i][4].toString() : "Chưa sử dụng"
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({ leads: leads.reverse() }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Tạo Menu đặc biệt trên thanh công cụ của Google Sheet khi mở file
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🐰 RabbitLie CRM")
    .addItem("📊 Tạo / Cập nhật Dashboard & Biểu Đồ", "createOrUpdateDashboard")
    .addToUi();
}

/**
 * Tự động tạo biểu đồ và bảng thống kê tổng quan ngay trong Google Sheet
 */
function createOrUpdateDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var leadsSheet = ss.getSheetByName(LEADS_SHEET_NAME);
  
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(LEADS_SHEET_NAME);
    leadsSheet.appendRow(["Thời gian", "Email", "Số điện thoại", "Mã Voucher", "Trạng thái"]);
  }
  
  var dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(DASHBOARD_SHEET_NAME, 0);
  } else {
    // Xóa biểu đồ cũ để vẽ mới
    var charts = dashSheet.getCharts();
    for (var c = 0; c < charts.length; c++) {
      dashSheet.removeChart(charts[c]);
    }
    dashSheet.clear();
  }
  
  // Thiết kế tiêu đề Dashboard
  dashSheet.getRange("A1:G1").merge()
    .setValue("🐰 RABBITLIE - TỔNG QUAN CHIẾN DỊCH VOUCHER 20%")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#8b0000") // Màu đỏ crimson của RabbitLie
    .setHorizontalAlignment("center");
    
  // 3 Thẻ KPI
  dashSheet.getRange("B3:C3").merge().setValue("TỔNG LƯỢT NHẬN MÃ").setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
  dashSheet.getRange("B4:C4").merge().setFormula('="👥 " & MAX(0, COUNTA(\'' + LEADS_SHEET_NAME + '\'!B2:B))').setFontSize(16).setFontWeight("bold").setHorizontalAlignment("center");
  
  dashSheet.getRange("D3:E3").merge().setValue("MÃ VOUCHER").setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
  dashSheet.getRange("D4:E4").merge().setValue("BADBUNNY20").setFontSize(16).setFontWeight("bold").setFontColor("#8b0000").setHorizontalAlignment("center");
  
  dashSheet.getRange("F3:G3").merge().setValue("TRẠNG THÁI HỆ THỐNG").setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
  dashSheet.getRange("F4:G4").merge().setValue("🟢 ĐANG HOẠT ĐỘNG").setFontSize(13).setFontWeight("bold").setFontColor("#15803d").setHorizontalAlignment("center");

  // Bảng phụ thống kê theo ngày (để vẽ biểu đồ)
  dashSheet.getRange("B7").setValue("Ngày");
  dashSheet.getRange("C7").setValue("Số lượt nhận mã");
  dashSheet.getRange("B7:C7").setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
  
  // Dùng công thức tự động lấy các ngày và đếm
  dashSheet.getRange("B8:B14").setValues([
    ["01/11/2026"], ["02/11/2026"], ["03/11/2026"], ["04/11/2026"], ["05/11/2026"], ["06/11/2026"], ["07/11/2026"]
  ]);
  for (var r = 8; r <= 14; r++) {
    dashSheet.getRange("C" + r).setFormula('=COUNTIF(\'' + LEADS_SHEET_NAME + '\'!A:A, "*" & B' + r + ' & "*")');
  }

  // TẠO BIỂU ĐỒ CỘT (Column Chart)
  var chartRange = dashSheet.getRange("B7:C14");
  var chart = dashSheet.newChart()
    .asColumnChart()
    .addRange(chartRange)
    .setPosition(7, 5, 0, 0)
    .setTitle("BIỂU ĐỒ SỐ LƯỢT ĐĂNG KÝ VOUCHER THEO NGÀY")
    .setOption("legend", { position: "none" })
    .setOption("colors", ["#8b0000"])
    .setOption("vAxis", { title: "Số lượt khách nhận mã", minValue: 0 })
    .setOption("hAxis", { title: "Ngày" })
    .build();
    
  dashSheet.insertChart(chart);
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(dashSheet);
}
