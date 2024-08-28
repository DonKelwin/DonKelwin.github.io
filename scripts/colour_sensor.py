from machine import I2C, Pin
import utime
from tcs3472 import TCS3472
import machine
import neopixel
import time

# Initialize I2C
i2c1 = I2C(0, scl=Pin(1), sda=Pin(0), freq=400000)
i2c2 = I2C(0, scl=Pin(21), sda=Pin(20), freq=400000)
#i2c3 =

# Initialize the sensor
sensor1 = TCS3472(i2c1)
sensor2 = TCS3472(i2c2)
#sensor3 = TCS3472(i2c3)

# LED Control Pin
led_pin_sensor1 = Pin(2, Pin.OUT)
led_pin_sensor2 = Pin(16, Pin.OUT)
#led_pin_sensor3 = Pin(_, Pin.OUT)

# Init-Value to compare to
init_value1 = [32885, 27628, 7588, 5940]
init_value2 = [65535, 56903, 16009, 14590]
init_value3 = [3654, 3040, 446, 507]

# Delta-Wert (je höher, desto mehr Unterschiede lässt er bei der Messung zu)
delta_value = 100

# Function to turn LED on
def led_on():
    led_pin_sensor1.value(1)
    led_pin_sensor2.value(1)
    #led_pin_sensor3.value(1)
    
# Function to turn LED off
def led_off():
    led_pin_sensor1.value(0)
    led_pin_sensor2.value(0)
    #led_pin_sensor3.value(0)

# Function to read RGB values
def read_rgb(sensor_number):
    if sensor_number == 1:
        clear, red, green, blue = sensor1.read()
    elif sensor_number == 2:
        clear, red, green, blue = sensor2.read()
    elif sensor_number == 3:
        clear, red, green, blue = sensor3.read()
    return clear, red, green, blue

def probe(sensor_number):
    probe = [0, 0, 0, 0]
    for i in range(10):
        utime.sleep(0.1)  # Wait for LED to stabilize
        clear, red, green, blue = read_rgb(sensor_number)
        probe[0] += clear
        probe[1] += red
        probe[2] += green
        probe[3] += blue
    probe[0] = int(probe[0] / 10)
    probe[1] = int(probe[1] / 10)
    probe[2] = int(probe[2] / 10)
    probe[3] = int(probe[3] / 10)
    return probe
    
def init(sensor_number):
    init = probe(sensor_number)
    for i in range(len(init)):
        if sensor_number == 1:
            init_value1[i] = init[i]
        elif sensor_number == 2:
            init_value2[i] = init[i]
        elif sensor_number == 3:
            init_value3[i] = init[i]
    print("init_value",sensor_number, "(clear,r,g,b): ", init)

            
def compare_correct(sensor_number):
    test = probe(sensor_number)
    print("test_value", sensor_number, "(clear,r,g,b): ", test)
    if sensor_number == 1:
        comp = [0, 0, 0, 0]
        comp[0] = abs(test[0] - init_value1[0])
        comp[1] = abs(test[1] - init_value1[1])
        comp[2] = abs(test[2] - init_value1[2])
        comp[3] = abs(test[3] - init_value1[3])
        print("delta to test1: comp_value (r,g,b): ", comp)
        for t in range(4):
            if comp[t] > delta_value:
                return False
        return True
    elif sensor_number == 2:
        comp = [0, 0, 0, 0]
        comp[0] = abs(test[0] - init_value2[0])
        comp[1] = abs(test[1] - init_value2[1])
        comp[2] = abs(test[2] - init_value2[2])
        comp[3] = abs(test[3] - init_value2[3])
        print("delta to test2: comp_value (r,g,b): ", comp)
        for t in range(4):
            if comp[t] > delta_value:
                return False
        return True
    elif sensor_number == 3:
        comp = [0, 0, 0, 0]
        comp[0] = abs(test[0] - init_value3[0])
        comp[1] = abs(test[1] - init_value3[1])
        comp[2] = abs(test[2] - init_value3[2])
        comp[3] = abs(test[3] - init_value3[3])
        print("delta to test3: comp_value (r,g,b): ", comp)
        for t in range(4):
            if comp[t] > delta_value:
                return False
        return True

# Anzahl der LEDs im Ring
NUM_LEDS = 12

# LED_Ring
pin = machine.Pin(10)

# Initialisiere das NeoPixel-Objekt
np = neopixel.NeoPixel(pin, NUM_LEDS)

#Einzelne LED
def set_led(led_number, color):
    np[led_number] = color
    np.write()

# Alle LED'S
def fill(color):
    for i in range(NUM_LEDS):
        np[i] = color
    np.write()
    
# Alle LEDs aus
def clear_all():
    for i in range(NUM_LEDS):
        np[i] = (0, 0, 0)
    np.write()
colors = [
    (255, 0, 0),    # Rot
    (0, 255, 0),    # Grün
    (0, 0, 255),    # Blau
    (0, 255, 255),  # Cyan
    (255, 0, 255)   # Magenta
]

base_color = (255, 255, 255)  # Cyan Helle Farbe

# Anpassung der Helligkeit
def dim_color(color, factor):
    val1 = color[0]
    val2 = color[1]
    val3 = color[2]
    return (int(val1 * factor), int(val2 * factor), int(val3 * factor))

# Dreht sich im Kreis für gewisse Sekunden duration
def spinning_pattern(duration):
    start_time = time.time()
    
    # Anzahl der LEDs, die gleichzeitig leuchten sollen
    trail_length = 4

    # Helligkeitsfaktoren für die LEDs im "Schweif"
    brightness_factors = [1.0, 0.6, 0.3, 0.1] 
    
    while time.time() - start_time < duration:
        for i in range(NUM_LEDS):
            for j in range(trail_length):
                led_index = (i - j) % NUM_LEDS
                color = dim_color(base_color, brightness_factors[j])
                set_led(led_index, color)
            
            for k in range(trail_length, NUM_LEDS):
                np[(i - k) % NUM_LEDS] = (0, 0, 0)
            
            # Zeige die Änderungen an
            np.write()
            
            # Warte kurz, bevor die nächste LED eingeschaltet wird
            time.sleep(0.1) 

    clear_all()


def light_show():
    # Beispiel: LEDs in grün leuchten lassen
    fill((255, 0, 0))  # RGB für rot
    time.sleep(1)
    # Beispiel: Zweite LED grün machen (Index 1)
    set_led(1, (0, 255, 0))  # RGB für grün
    time.sleep(1)
    # Beispiel: Dritte LED blau machen (Index 2)
    set_led(2, (0, 0, 255))  # RGB für blau
    time.sleep(1)
    #Beispiel spinning mit Duration in s
    spinning_pattern(4)
 

#Lichtshow
#light_show()

#Values messen_____________________________

#Eingangsmessung
#init(1)
#init(2)
#init(3)


#Vergleichsmessung
def messung():
    led_on() #Anpassen für Glow-in-the-dark zu off
    clear_all()
    valid1 = compare_correct(1)
    valid2 = compare_correct(2)
   #valid = compare_correct(1) and compare_correct(2) and compare_correct(3):
    spinning_pattern(1.5)
    time.sleep(0.5)
    if valid1 and valid2:
        fill((0,255,0))
        print("Correct color-value")
    else:
        fill((255,0,0))
    time.sleep(1)

    #Cleanup
    led_off()
    clear_all()

#Start of Routine____________________________
    
#Startup
messung()

