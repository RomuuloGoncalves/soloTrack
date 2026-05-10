#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> // Lembre-se de instalar a biblioteca ArduinoJson no Arduino IDE

const char* ssid = "WOME_WIFI";
const char* password = "SENHA_WIFI";

const char* api_url = "http://192.168.0.100:8000/api/iot/leituras"; 

String mac_address;

const char* qr_code_hash_atual = "abc123xyz"; 

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
  
  // 2. Coleta o MAC Address que vai identificar este dispositivo no Laravel
  mac_address = WiFi.macAddress();
  Serial.println("MAC Address do Equipamento: " + mac_address);
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(api_url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");

    StaticJsonDocument<512> doc;
    
    // Identificação
    doc["mac_address"] = mac_address;
    doc["qr_code_hash"] = qr_code_hash_atual;

    // Array de leituras (o pulo do gato do EAV)
    JsonArray leituras = doc.createNestedArray("leituras");

    // ---> SENSOR 1: Simulando Sensor de Nitrogênio (tipo_sensor_id = 1)
    JsonObject sensor1 = leituras.createNestedObject();
    sensor1["tipo_sensor_id"] = 1;
    sensor1["valor"] = random(30, 60) + (random(0, 100) / 100.0); // Valor flutuante entre 30 e 60

    // ---> SENSOR 2: Simulando Sensor de Umidade do Solo (tipo_sensor_id = 4)
    JsonObject sensor2 = leituras.createNestedObject();
    sensor2["tipo_sensor_id"] = 4;
    sensor2["valor"] = random(50, 80) + (random(0, 100) / 100.0); // Valor flutuante entre 50 e 80

    // Converter objeto para string
    String json_string;
    serializeJson(doc, json_string);
    
    Serial.println("\n--- Enviando Pacote de Dados ---");
    Serial.println(json_string);

    int httpResponseCode = http.POST(json_string);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Código HTTP: " + String(httpResponseCode));
      Serial.println("Resposta do Laravel: " + response);
    } else {
      Serial.println("Erro na requisição HTTP: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("Erro: WiFi Desconectado.");
  }
  
  // Aguarda 1 minuto para realizar a próxima leitura
  delay(60000); 
}
