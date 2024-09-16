from machine import I2C, Pin
import time

i2c = I2C(1, scl=Pin(15), sda=Pin(14), freq=400000)

PCA9548A_ADDR = 0x70
TCS3472_ADDR = 0x29

CHANNEL_NAMES = ["Fillennium Malcon", "X-Wing", "TIE-Fighter"]

#Channelauswahl auf dem Multiplexer für die Farbsensoren
def select_channel(i2c, channel):
    if channel < 0 or channel > 7:
        raise ValueError("Kanal muss zwischen 0 und 7 liegen.")
    i2c.writeto(PCA9548A_ADDR, bytearray([1 << channel]))
    time.sleep(0.2)  # Kurze Pause, um sicherzustellen, dass der Kanal richtig gesetzt ist

# Funktion zum Initialisieren des TCS3472 Sensors
def init_tcs3472(i2c):
    i2c.writeto_mem(TCS3472_ADDR, 0x80 | 0x00, b'\x03')  
    i2c.writeto_mem(TCS3472_ADDR, 0x80 | 0x01, b'\xD5')  
    time.sleep(0.3)  

# Funktion zum Auslesen der Farbwerte
def read_color_values(i2c):
    clear = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x14, 2), 'little')
    red = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x16, 2), 'little')
    green = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x18, 2), 'little')
    blue = int.from_bytes(i2c.readfrom_mem(TCS3472_ADDR, 0x80 | 0x1A, 2), 'little')
    
    return [clear, red, green, blue]

# Funktion, um die Durchschnittswerte der Messungen zu berechnen
def average_measurements(num_measurements):
    totals = [0, 0, 0, 0]
    for _ in range(num_measurements):
        color_values = read_color_values(i2c)
        totals = [total + value for total, value in zip(totals, color_values)]
        time.sleep(0.1)
    
    # Durchschnitt berechnen
    averages = [int(total / num_measurements) for total in totals]
    return averages

# Funktion, um die Durchschnittswerte von allen Sensoren zu scannen
def read_all_sensors(num_measurements):
    results = []
    for channel in range(3):
        select_channel(i2c, channel)
        init_tcs3472(i2c)
        averages = average_measurements(num_measurements)
        results.append((CHANNEL_NAMES[channel], averages))
    return results

led_pin_sensor1 = Pin(8, Pin.OUT)
led_pin_sensor2 = Pin(9, Pin.OUT)
led_pin_sensor3 = Pin(16, Pin.OUT)
led_pin_sensor1.value(0)
led_pin_sensor2.value(0)
led_pin_sensor3.value(0)
print(read_all_sensors(7))