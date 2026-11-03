/**
 * RABBITLIE CRM - GOOGLE APPS SCRIPT HOÀN CHỈNH (TỰ ĐỘNG CẬP NHẬT 100%)
 * 
 * ID Trang tính của bạn: 1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs
 * 
 * HƯỚNG DẪN CÀI ĐẶT 1 LẦN DUY NHẤT:
 * 1. Mở: https://docs.google.com/spreadsheets/d/1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs/edit
 * 2. Chọn Tiện ích mở rộng (Extensions) -> Apps Script
 * 3. Xoá sạch code cũ, dán toàn bộ file này vào -> Bấm biểu tượng "Lưu" (Ctrl + S).
 * 4. Bấm nút "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment):
 *    - Nhấn bánh răng -> Chọn "Ứng dụng web" (Web app)
 *    - Mô tả: RabbitLie CRM v2
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me)
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone)  <--- BẮT BUỘC CHỌN CÁI NÀY!
 * 5. Bấm "Triển khai" -> Cấp quyền (Nếu báo "Google chưa xác minh", bấm "Nâng cao" -> "Đi tới...").
 * 6. Copy link "URL của ứng dụng web" (dạng https://script.google.com/macros/s/.../exec).
 */

var SPREADSHEET_ID = "1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs";
var LEADS_SHEET_NAME = "Danh Sách Nhận Mã";
var DASHBOARD_SHEET_NAME = "Dashboard & Biểu Đồ";

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * XỬ LÝ NHẬN DỮ LIỆU TỰ ĐỘNG TỪ WEBSITE
 */
function doPost(e) {
  try {
    var ss = getSpreadsheet();
    var leadsSheet = ss.getSheetByName(LEADS_SHEET_NAME);
    
    // Nếu chưa có tab Danh Sách, tự động khởi tạo chuẩn
    if (!leadsSheet) {
      leadsSheet = ss.insertSheet(LEADS_SHEET_NAME);
      leadsSheet.appendRow(["Thời gian", "Email", "Số điện thoại", "Mã Voucher", "Trạng thái"]);
      leadsSheet.getRange(1, 1, 1, 5)
        .setFontWeight("bold")
        .setBackground("#1e293b")
        .setFontColor("#ffffff")
        .setHorizontalAlignment("center");
      leadsSheet.setFrozenRows(1);
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    // 1. Nếu là sự kiện ghi nhận lượt truy cập (Page View)
    if (data.action === "track_pageview") {
      updatePageViews(ss, data.totalViews || 1);
      return ContentService.createTextOutput(JSON.stringify({ result: "success", type: "pageview" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Nếu là khách đăng ký nhận mã voucher 20%
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy, HH:mm:ss");
    var email = (data.email || "").toString().trim();
    var phone = (data.phone || "").toString().trim();
    var voucher = data.voucherCode || "BADBUNNY20";
    
    // Tự động thêm dòng mới vào Google Sheet (hiển thị lập tức)
    leadsSheet.appendRow([
      timestamp,
      email,
      "'" + phone, // Dấu nháy đơn để giữ số 0 ở đầu
      voucher,
      "Chưa sử dụng"
    ]);
    
    // Đảm bảo Dashboard và Biểu đồ tự động tồn tại và đồng bộ
    ensureDashboard(ss);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "Đã lưu vào Google Sheet tự động thành công!" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * XỬ LÝ GET ĐỂ ĐỌC DỮ LIỆU SANG TRANG ADMIN WEBSITE
 */
function doGet(e) {
  try {
    var ss = getSpreadsheet();
    var leadsSheet = ss.getSheetByName(LEADS_SHEET_NAME);
    
    if (!leadsSheet || leadsSheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ leads: [], pageViews: 0 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = leadsSheet.getDataRange().getValues();
    var leads = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] || data[i][2]) { // Có email hoặc SĐT
        leads.push({
          timestamp: data[i][0] ? data[i][0].toString() : "",
          email: data[i][1] ? data[i][1].toString() : "",
          phone: data[i][2] ? data[i][2].toString().replace("'", "") : "",
          voucherCode: data[i][3] ? data[i][3].toString() : "BADBUNNY20",
          status: data[i][4] ? data[i][4].toString() : "Chưa sử dụng"
        });
      }
    }
    
    var dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
    var pageViews = 0;
    if (dashSheet) {
      var val = dashSheet.getRange("B4").getValue();
      pageViews = parseInt(val) || 0;
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      leads: leads.reverse(), 
      totalViews: pageViews 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * TẠO MENU TRÊN THANH CÔNG CỤ CỦA SHEET
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("🐰 RabbitLie CRM")
    .addItem("📊 Làm mới Dashboard & Biểu Đồ", "setupDashboardManual")
    .addToUi();
}

function setupDashboardManual() {
  var ss = getSpreadsheet();
  ensureDashboard(ss, true);
}

/**
 * CẬP NHẬT SỐ LƯỢT XEM TRANG VÀO SHEET
 */
function updatePageViews(ss, views) {
  var dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  if (!dashSheet) {
    ensureDashboard(ss);
    dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  }
  if (dashSheet) {
    dashSheet.getRange("B4").setValue(views);
  }
}

/**
 * TẠO DASHBOARD VÀ BIỂU ĐỒ TỰ ĐỘNG BẰNG CÔNG THỨC REAL-TIME (TỰ UPDATE MỖI KHI CÓ KHÁCH)
 */
function ensureDashboard(ss, forceRebuild) {
  var dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  if (dashSheet && !forceRebuild) {
    return; // Đã có rồi thì giữ nguyên các công thức tự động cập nhật
  }
  
  if (!dashSheet) {
    dashSheet = ss.insertSheet(DASHBOARD_SHEET_NAME, 0);
  } else if (forceRebuild) {
    var charts = dashSheet.getCharts();
    for (var c = 0; c < charts.length; c++) {
      dashSheet.removeChart(charts[c]);
    }
    dashSheet.clear();
  }
  
  // Banner tiêu đề
  dashSheet.getRange("A1:G1").merge()
    .setValue("🐰 RABBITLIE - BÁO CÁO TỔNG QUAN CHIẾN DỊCH VOUCHER 20%")
    .setFontSize(15)
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#8b0000")
    .setHorizontalAlignment("center");

  // 4 Khối KPI tự động tính toán
  dashSheet.getRange("B3").setValue("LƯỢT TRUY CẬP WEB").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
  dashSheet.getRange("B4").setValue(150).setFontSize(18).setFontWeight("bold").setFontColor("#2563eb").setHorizontalAlignment("center");
  
  dashSheet.getRange("C3:D3").merge().setValue("KHÁCH NHẬN VOUCHER").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
  // Công thức tự động đếm số khách hàng trong sheet Danh Sách Nhận Mã
  dashSheet.getRange("C4:D4").merge().setFormula('="👥 " & MAX(0, COUNTA(\'' + LEADS_SHEET_NAME + '\'!B2:B))').setFontSize(18).setFontWeight("bold").setHorizontalAlignment("center");
  
  dashSheet.getRange("E3").setValue("MÃ VOUCHER").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
  dashSheet.getRange("E4").setValue("BADBUNNY20").setFontSize(16).setFontWeight("bold").setFontColor("#8b0000").setHorizontalAlignment("center");
  
  dashSheet.getRange("F3:G3").merge().setValue("TỶ LỆ CHUYỂN ĐỔI").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
  dashSheet.getRange("F4:G4").merge().setFormula('="🎯 " & TEXT(MAX(0, COUNTA(\'' + LEADS_SHEET_NAME + '\'!B2:B)) / MAX(1, B4), "0.0%")').setFontSize(16).setFontWeight("bold").setFontColor("#15803d").setHorizontalAlignment("center");

  // Bảng phụ dữ liệu ngày để cấp nguồn cho BIỂU ĐỒ CỘT
  dashSheet.getRange("B7").setValue("Ngày");
  dashSheet.getRange("C7").setValue("Lượt nhận mã");
  dashSheet.getRange("B7:C7").setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");

  // Điền ngày tự động lùi 7 ngày gần nhất
  var today = new Date();
  var rows = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(today.getDate() - i);
    rows.push([Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "dd/MM/yyyy")]);
  }
  dashSheet.getRange("B8:B14").setValues(rows);

  // Đặt công thức COUNTIF tự động đếm theo từng ngày
  for (var r = 8; r <= 14; r++) {
    dashSheet.getRange("C" + r).setFormula('=COUNTIF(\'' + LEADS_SHEET_NAME + '\'!A:A, "*" & B' + r + ' & "*")');
  }

  // TẠO BIỂU ĐỒ CỘT REAL-TIME
  var chartRange = dashSheet.getRange("B7:C14");
  var chart = dashSheet.newChart()
    .asColumnChart()
    .addRange(chartRange)
    .setPosition(7, 5, 0, 0)
    .setTitle("BIỂU ĐỒ TĂNG TRƯỞNG NHẬN VOUCHER THEO NGÀY")
    .setOption("colors", ["#8b0000"])
    .setOption("legend", { position: "none" })
    .setOption("vAxis", { title: "Số lượt đăng ký", minValue: 0 })
    .setOption("hAxis", { title: "Ngày" })
    .build();

  dashSheet.insertChart(chart);
}
