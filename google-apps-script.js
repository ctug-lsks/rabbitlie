/**
 * RABBITLIE CRM - GOOGLE APPS SCRIPT V3 (KHẮC PHỤC TRIỆT ĐỂ LỖI #ERROR!)
 * 
 * ID Trang tính của bạn: 1Vlw1q8q3v6b1Y4DduG06O6cmCcqZAhgIn0jF425bOSs
 * 
 * NGUYÊN NHÂN LỖI #ERROR! VỪA RỒI:
 * Google Sheet cài đặt định dạng tiếng Việt dùng dấu chấm phẩy (;) trong công thức 
 * thay vì dấu phẩy (,), dẫn đến lỗi phân tích cú pháp công thức.
 * 
 * GIẢI PHÁP V3:
 * Script tự động tính toán số liệu và điền số trực tiếp (KHÔNG dùng công thức), 
 * đảm bảo 100% KHÔNG BAO GIỜ bị lỗi #ERROR!, biểu đồ hiển thị ngay lập tức!
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
 * XỬ LÝ NHẬN DỮ LIỆU TỰ ĐỘNG TỪ WEBSITE KHI KHÁCH BẤM NHẬN VOUCHER
 */
function doPost(e) {
  try {
    var ss = getSpreadsheet();
    var leadsSheet = ss.getSheetByName(LEADS_SHEET_NAME);
    
    // Nếu chưa có tab Danh Sách, tự động khởi tạo
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
    
    // 1. Xử lý ghi nhận lượt truy cập (Page View)
    if (data.action === "track_pageview") {
      updateDashboardData(ss, data.totalViews);
      return ContentService.createTextOutput(JSON.stringify({ result: "success", type: "pageview" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. Xử lý khách đăng ký nhận mã voucher 20%
    var timestamp = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy, HH:mm:ss");
    var email = (data.email || "").toString().trim();
    var phone = (data.phone || "").toString().trim();
    var voucher = data.voucherCode || "BADBUNNY20";
    
    // Thêm dòng mới vào sheet Danh Sách
    leadsSheet.appendRow([
      timestamp,
      email,
      "'" + phone, // Dấu nháy đơn để không bị mất số 0 đầu
      voucher,
      "Chưa sử dụng"
    ]);
    
    // Tự động cập nhật lại Dashboard & Biểu đồ ngay lập tức
    updateDashboardData(ss);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "success", 
      message: "Đã lưu vào Google Sheet thành công!" 
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
      return ContentService.createTextOutput(JSON.stringify({ leads: [], totalViews: 0 }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = leadsSheet.getDataRange().getValues();
    var leads = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] || data[i][2]) {
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
      pageViews = parseInt(dashSheet.getRange("B4").getValue()) || 0;
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
    .addItem("📊 Cập nhật Dashboard & Xóa lỗi #ERROR!", "setupDashboardManual")
    .addToUi();
}

function setupDashboardManual() {
  var ss = getSpreadsheet();
  updateDashboardData(ss, null, true);
}

/**
 * TÍNH TOÁN VÀ ĐIỀN SỐ TRỰC TIẾP (HOÀN TOÀN KHÔNG BỊ LỖI #ERROR!)
 */
function updateDashboardData(ss, customViews, forceRebuild) {
  var leadsSheet = ss.getSheetByName(LEADS_SHEET_NAME);
  if (!leadsSheet) {
    leadsSheet = ss.insertSheet(LEADS_SHEET_NAME);
    leadsSheet.appendRow(["Thời gian", "Email", "Số điện thoại", "Mã Voucher", "Trạng thái"]);
  }

  var dashSheet = ss.getSheetByName(DASHBOARD_SHEET_NAME);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(DASHBOARD_SHEET_NAME, 0);
    forceRebuild = true;
  }

  // Nếu cần dựng lại khung
  if (forceRebuild) {
    var charts = dashSheet.getCharts();
    for (var c = 0; c < charts.length; c++) {
      dashSheet.removeChart(charts[c]);
    }
    dashSheet.clear();

    // Tiêu đề
    dashSheet.getRange("A1:G1").merge()
      .setValue("🐰 RABBITLIE - TỔNG QUAN CHIẾN DỊCH VOUCHER 20%")
      .setFontSize(15)
      .setFontWeight("bold")
      .setFontColor("#ffffff")
      .setBackground("#8b0000")
      .setHorizontalAlignment("center");

    // Khung 4 thẻ KPI
    dashSheet.getRange("B3").setValue("LƯỢT TRUY CẬP").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
    dashSheet.getRange("C3:D3").merge().setValue("KHÁCH NHẬN VOUCHER").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
    dashSheet.getRange("E3").setValue("MÃ VOUCHER").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");
    dashSheet.getRange("F3:G3").merge().setValue("TỶ LỆ CHUYỂN ĐỔI").setFontWeight("bold").setBackground("#f1f5f9").setHorizontalAlignment("center");

    dashSheet.getRange("E4").setValue("BADBUNNY20").setFontSize(16).setFontWeight("bold").setFontColor("#8b0000").setHorizontalAlignment("center");

    // Tiêu đề bảng phụ biểu đồ
    dashSheet.getRange("B7").setValue("Ngày");
    dashSheet.getRange("C7").setValue("Lượt nhận mã");
    dashSheet.getRange("B7:C7").setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff").setHorizontalAlignment("center");
  }

  // 1. TÍNH TOÁN DỮ LIỆU THỰC TẾ TRONG SHEET LEADS (KHÔNG DÙNG FORMULA)
  var totalRows = leadsSheet.getLastRow();
  var totalLeads = Math.max(0, totalRows - 1);

  // Lấy lượt xem hiện tại hoặc gán số mới
  var currentViews = customViews || parseInt(dashSheet.getRange("B4").getValue()) || 150;
  if (customViews) {
    currentViews = customViews;
  }

  var convRate = ((totalLeads / Math.max(1, currentViews)) * 100).toFixed(1) + "%";

  // Điền trực tiếp giá trị vào ô (SẠCH SẼ, KHÔNG LỖI)
  dashSheet.getRange("B4").setValue(currentViews).setFontSize(18).setFontWeight("bold").setFontColor("#2563eb").setHorizontalAlignment("center");
  dashSheet.getRange("C4:D4").merge().setValue("👥 " + totalLeads).setFontSize(18).setFontWeight("bold").setFontColor("#0f172a").setHorizontalAlignment("center");
  dashSheet.getRange("F4:G4").merge().setValue("🎯 " + convRate).setFontSize(16).setFontWeight("bold").setFontColor("#15803d").setHorizontalAlignment("center");

  // 2. THỐNG KÊ 7 NGÀY GẦN NHẤT
  var dateCounts = {};
  if (totalRows > 1) {
    var dateValues = leadsSheet.getRange(2, 1, totalRows - 1, 1).getValues();
    for (var i = 0; i < dateValues.length; i++) {
      var str = (dateValues[i][0] || "").toString();
      var datePart = str.split(",")[0].trim(); // lấy dd/MM/yyyy
      if (datePart) {
        dateCounts[datePart] = (dateCounts[datePart] || 0) + 1;
      }
    }
  }

  var today = new Date();
  var dateRows = [];
  var countRows = [];

  for (var k = 6; k >= 0; k--) {
    var d = new Date();
    d.setDate(today.getDate() - k);
    var dStr = Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "dd/MM/yyyy");
    dateRows.push([dStr]);
    countRows.push([dateCounts[dStr] || 0]); // Ghi số nguyên thực tế: 0, 1, 2...
  }

  dashSheet.getRange("B8:B14").setValues(dateRows).setHorizontalAlignment("center");
  dashSheet.getRange("C8:C14").setValues(countRows).setHorizontalAlignment("center");

  // 3. TẠO BIỂU ĐỒ NẾU CHƯA CÓ HOẶC VỪA BUILD LẠI
  if (forceRebuild || dashSheet.getCharts().length === 0) {
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
}
