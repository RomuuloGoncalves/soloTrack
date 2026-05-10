# Integração IoT (Arduino/ESP32) -> SoloTrack Backend

Esta documentação descreve o fluxo de dados entre os dispositivos físicos de medição (ESP32/Arduino) e a API do SoloTrack.

---

## 1. O Hardware (O "Bastão" ou Módulo Sensor)

O dispositivo de hardware atua como um hub central (gateway). Ele possui:
* Uma conexão **Wi-Fi** para falar com a internet.
* Sensores físicos plugados em suas portas (Umidade, NPK, pH, etc).
* Um **MAC Address** único de fábrica, que o sistema SoloTrack usa para identificar qual é o equipamento e quem é o dono dele (pois o Equipamento está amarrado ao Usuário no banco de dados).

O código-fonte do ESP32/Arduino está localizado na pasta `Sketches/SoloTrackNode.ino`.

### Dependências no Arduino IDE
Para compilar e subir o código para a placa, é necessário instalar as seguintes bibliotecas pela aba *Gerenciador de Bibliotecas* do Arduino IDE:
1. `WiFi.h` e `HTTPClient.h` (Nativas do pacote da placa ESP32)
2. `ArduinoJson` (Por Benoit Blanchon) - Essencial para montar o payload EAV.

---

## 2. A Rota na API

Foi criada uma rota específica para receber o tráfego das máquinas:

`POST /api/iot/leituras`

**Por que não usar Sanctum?**
Dispositivos IoT possuem pouca memória e poder de processamento para lidar com cookies, tokens dinâmicos de CSRF e sessões de login tradicionais. Portanto, esta rota está aberta publicamente, mas é **protegida por negócio**: ela exige no JSON um `mac_address` que esteja previamente cadastrado na tabela `equipamentos` do banco.

---

## 3. Formato do JSON (Payload EAV)

O ESP32 junta a leitura de todos os seus sensores em um único disparo HTTP usando um array de objetos. 

```json
{
  "mac_address": "A1:B2:C3:D4:E5:F6",
  "qr_code_hash": "abc123xyz",
  "leituras": [
    {
      "tipo_sensor_id": 1,
      "valor": 45.2
    },
    {
      "tipo_sensor_id": 4,
      "valor": 62.1
    }
  ]
}
```

* **`mac_address`**: Diz "Eu sou a máquina XYZ".
* **`qr_code_hash`**: Diz "Estou fincado agora na Estufa 1".
* **`tipo_sensor_id`**: Diz "Esta leitura aqui é de Nitrogênio" (Baseado na tabela `tipo_sensors`).

---

## 4. Testando a Rota Localmente (Postman)

Você pode simular o Arduino enviando os dados usando o Postman:
1. Abra o Postman.
2. Vá em `File > Import`.
3. Selecione o arquivo `Documentos/postman_solotrack_iot.json` gerado no repositório.
4. Execute o POST. (Lembre-se que você precisa ter as `area_plantios`, `equipamentos` e `tipo_sensors` populados no banco de dados para a validação do Laravel passar).

---

## 5. Lógica Interna (`LeituraController`)

Ao receber o JSON, o `LeituraController@receberDadosIot` faz o seguinte:
1. **Validação**: Verifica se os campos existem. Bate no banco para ver se o MAC Address e o QR Code são de fato reais.
2. **Transação**: Abre uma `DB::beginTransaction()`.
3. **Desmembramento**: Faz um `foreach` no array de `leituras`. Se vieram 4 sensores no JSON, ele faz 4 `Inserts` separados na tabela `leituras`.
4. **Confirmação**: Se todos os inserts derem certo, ele executa um `DB::commit()` e salva de verdade.
5. **Resposta**: Retorna HTTP Status `201 Created` para o Arduino. Se algo falhar, dá `DB::rollBack()` e avisa o erro `500`.
