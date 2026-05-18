#include <ArduinoJson.h>

#include <b64.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <WiFi.h>
// ==========================================
// CONFIGURAÇÕES DE REDE
// ==========================================
const char* ssid = "#";
const char* password = "#";

// ==========================================
// CONFIGURAÇÕES DA API (SoloTrack)
// ==========================================
const char* api_url = "http://[IP_ADDRESS]/api/iot/leituras"; 


// Hash da área de plantio cadastrada no banco de dados (Area ID 1)
const char* qr_code_hash_atual = "89ff493e-e1ab-40b0-81ac-dd89cdc00bba"; 

String mac_address;

void setup() {
  Serial.begin(115200);
  
  // 1. Inicializa Conexão WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nConectado com Sucesso!");
  
  // 2. Coleta o MAC Address
  // No futuro, substituir por: mac_address = WiFi.macAddress();
  mac_address = "A1:B2:C3:D4:E5:F6";
  
  Serial.println("==============================================");
  Serial.println(mac_address);
  Serial.println("==============================================");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(api_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");

    // Capacidade do Documento JSON (Atualizado para V7)
    JsonDocument doc;
    
    // Identificação para o Backend
    doc["mac_address"] = mac_address;
    doc["qr_code_hash"] = qr_code_hash_atual;

    // Array de leituras (Atualizado para V7)
    JsonArray leituras = doc["leituras"].to<JsonArray>();

    // ---> DADO FAKE 1: Temperatura
    JsonObject sensorTemp = leituras.add<JsonObject>();
    sensorTemp["tipo_sensor_id"] = 1; 
    sensorTemp["valor"] = random(20, 35) + (random(0, 100) / 100.0);

    // ---> DADO FAKE 2: Umidade do Ar
    JsonObject sensorUmidAr = leituras.add<JsonObject>();
    sensorUmidAr["tipo_sensor_id"] = 2; 
    sensorUmidAr["valor"] = random(40, 70) + (random(0, 100) / 100.0);

    // ---> DADO FAKE 3: Umidade do Solo
    JsonObject sensorUmidSolo = leituras.add<JsonObject>();
    sensorUmidSolo["tipo_sensor_id"] = 3; 
    sensorUmidSolo["valor"] = random(30, 80) + (random(0, 100) / 100.0);
    
    // ---> DADO FAKE 4: pH do Solo
    JsonObject sensorPh = leituras.add<JsonObject>();
    sensorPh["tipo_sensor_id"] = 4; 
    sensorPh["valor"] = random(5, 7) + (random(0, 100) / 100.0);

    // Converter objeto JSON para string
    String json_string;
    serializeJson(doc, json_string);
    
    Serial.println("\n--- Enviando Pacote ---");
    Serial.println(json_string);

    // Enviar POST
    int httpResponseCode = http.POST(json_string);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("Código HTTP: ");
      Serial.println(httpResponseCode);
      Serial.println("Resposta: " + response);
    } else {
      Serial.print("Erro HTTP: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  } else {
    Serial.println("WiFi Desconectado.");
  }
  
  delay(10000); 
}
