package com.laikaclub.admin.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ExporterService {

    private static final Logger logger = LoggerFactory.getLogger(ExporterService.class);

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;

    @Autowired
    public ExporterService(DataSource dataSource) {
        this.dataSource = dataSource;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public List<String> getAllTables() throws SQLException {
        List<String> tables = new ArrayList<>();
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            String dbProduct = meta.getDatabaseProductName().toLowerCase();
            
            // For SQLite, standard catalog/schema patterns vary, so we query directly or use '%'
            try (ResultSet rs = meta.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    if (!tableName.startsWith("sqlite_")) {
                        tables.add(tableName);
                    }
                }
            }
        }
        Collections.sort(tables);
        return tables;
    }

    public Map<String, List<Map<String, Object>>> getDatabaseData() throws Exception {
        Map<String, List<Map<String, Object>>> dbData = new LinkedHashMap<>();
        List<String> tables = getAllTables();

        try (Connection conn = dataSource.getConnection()) {
            for (String table : tables) {
                List<Map<String, Object>> rows = new ArrayList<>();
                String query = "SELECT * FROM `" + table + "` LIMIT 1000";
                
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery(query)) {
                    
                    ResultSetMetaData rsmd = rs.getMetaData();
                    int columnCount = rsmd.getColumnCount();
                    
                    while (rs.next()) {
                        Map<String, Object> row = new LinkedHashMap<>();
                        for (int i = 1; i <= columnCount; i++) {
                            String columnName = rsmd.getColumnName(i);
                            Object value = rs.getObject(i);
                            
                            // Clean binary types or other complex types to standard strings/numbers if needed
                            if (value instanceof java.sql.Timestamp) {
                                value = ((java.sql.Timestamp) value).toLocalDateTime().toString();
                            } else if (value instanceof java.sql.Date) {
                                value = ((java.sql.Date) value).toLocalDate().toString();
                            }
                            
                            row.put(columnName, value);
                        }
                        rows.add(row);
                    }
                } catch (Exception e) {
                    logger.warn("No se pudieron consultar datos de la tabla: {}", table);
                }
                dbData.put(table, rows);
            }
        }
        return dbData;
    }

    public byte[] exportToJson() throws Exception {
        Map<String, List<Map<String, Object>>> data = getDatabaseData();
        return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(data);
    }

    public byte[] exportToExcel() throws Exception {
        Map<String, List<Map<String, Object>>> data = getDatabaseData();
        
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (Map.Entry<String, List<Map<String, Object>>> entry : data.entrySet()) {
                String tableName = entry.getKey();
                List<Map<String, Object>> rows = entry.getValue();

                // Excel sheet names max 31 characters
                String sheetName = tableName.substring(0, Math.min(31, tableName.length()));
                Sheet sheet = workbook.createSheet(sheetName);

                if (rows.isEmpty()) {
                    Row headerRow = sheet.createRow(0);
                    Cell cell = headerRow.createCell(0);
                    cell.setCellValue("Sin registros");
                    continue;
                }

                // Create header row
                Row headerRow = sheet.createRow(0);
                Map<String, Object> firstRow = rows.get(0);
                List<String> columns = new ArrayList<>(firstRow.keySet());
                
                for (int i = 0; i < columns.size(); i++) {
                    Cell cell = headerRow.createCell(i);
                    cell.setCellValue(columns.get(i));
                    cell.setCellStyle(headerStyle);
                }

                // Create data rows
                for (int r = 0; r < rows.size(); r++) {
                    Row row = sheet.createRow(r + 1);
                    Map<String, Object> rowData = rows.get(r);
                    for (int c = 0; c < columns.size(); c++) {
                        Cell cell = row.createCell(c);
                        Object val = rowData.get(columns.get(c));
                        
                        if (val == null) {
                            cell.setCellValue("");
                        } else if (val instanceof Number) {
                            cell.setCellValue(((Number) val).doubleValue());
                        } else if (val instanceof Boolean) {
                            cell.setCellValue((Boolean) val);
                        } else {
                            cell.setCellValue(val.toString());
                        }
                    }
                }

                // Auto-fit columns
                for (int i = 0; i < columns.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            workbook.write(bos);
            return bos.toByteArray();
        }
    }

    public byte[] exportToPdf() throws Exception {
        List<String> tables = getAllTables();
        
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, bos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("LAIKA CLUB - DATABASE REPORT", titleFont));
            document.add(new Paragraph("Generado el: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")), subtitleFont));
            document.add(new Paragraph("-----------------------------------------------------------------------------------------------------"));
            document.add(new Paragraph(" "));
            
            document.add(new Paragraph("RESUMEN DE TABLAS", headerFont));
            document.add(new Paragraph(" "));

            try (Connection conn = dataSource.getConnection()) {
                for (String table : tables) {
                    long count = 0;
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM `" + table + "`")) {
                        if (rs.next()) {
                            count = rs.getLong(1);
                        }
                    } catch (Exception e) {
                        logger.warn("No se pudo obtener conteo para la tabla: {}", table);
                    }
                    
                    document.add(new Paragraph("• " + table + ": " + count + " registros", bodyFont));
                }
            }

            document.close();
            return bos.toByteArray();
        }
    }

    public String exportToSvg() throws Exception {
        List<String> tables = getAllTables();
        int svgWidth = 800;
        int svgHeight = Math.max(600, tables.size() * 40 + 100);

        StringBuilder svg = new StringBuilder();
        svg.append(String.format("<svg width=\"%d\" height=\"%d\" xmlns=\"http://www.w3.org/2000/svg\">\n", svgWidth, svgHeight));
        svg.append("  <rect width=\"100%\" height=\"100%\" fill=\"#ffffff\" />\n");
        svg.append("  <text x=\"25\" y=\"40\" font-family=\"Arial\" font-size=\"20\" font-weight=\"bold\" fill=\"#000000\">LAIKA DATABASE SCHEMA</text>\n");
        svg.append(String.format("  <text x=\"25\" y=\"65\" font-family=\"Arial\" font-size=\"12\" fill=\"#666666\">Generado: %s</text>\n", 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))));

        int y = 100;
        for (int i = 0; i < tables.size(); i++) {
            String table = tables.get(i);
            String color = (i % 2 == 0) ? "#f0f0f0" : "#e0e0e0";
            
            svg.append(String.format("  <rect x=\"20\" y=\"%d\" width=\"300\" height=\"30\" rx=\"5\" fill=\"%s\" stroke=\"#cccccc\"/>\n", y, color));
            svg.append(String.format("  <text x=\"35\" y=\"%d\" font-family=\"Arial\" font-size=\"14\" font-weight=\"bold\">%s</text>\n", y + 20, table.toUpperCase()));
            
            y += 40;
        }

        svg.append("</svg>");
        return svg.toString();
    }
}
