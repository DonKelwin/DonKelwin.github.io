from machine import Pin
import neopixel
import time

class LED_Line:
    def __init__(self, num_leds, led_pin):
        self.NUM_LEDS = num_leds
        self.led_pin = Pin(led_pin)

        # Initialisiere das NeoPixel-Objekt
        self.np = neopixel.NeoPixel(self.led_pin, self.NUM_LEDS)
        self.colors = {
            "red": (255, 0, 0),    # Rot
            "green": (0, 255, 0),    # Grün
            "blue": (0, 0, 255),    # Blau
            "cyan": (0, 255, 255),  # Cyan
            "magenta": (255, 0, 255)   # Magenta
            }

        self.base_color = (255, 255, 255)  # Cyan Helle Farbe
        self.clear = (0, 0, 0)
    
    
    #Einzelne LED
    def set_led(self, led_number, color):
        self.np[led_number] = color
        self.np.write()

    # Alle LED'S
    def fill(self, color):
        for i in range(self.NUM_LEDS):
            self.np[i] = color
        self.np.write()
    
    # Alle LEDs aus
    def clear_all(self):
        for i in range(self.NUM_LEDS):
            self.np[i] = (0, 0, 0)
        self.np.write()
        

test = LED_Line(12, 13)
test.fill(test.base_color)
time.sleep(5)
test.clear_all()