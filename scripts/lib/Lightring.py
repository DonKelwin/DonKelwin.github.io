from machine import Pin
from random import randint
import neopixel
import time
import sys

class Lightring():
    

    # Initialize the Lightring object.
    #
    # Parameters:
    # - num_leds (int): The number of LEDs in the ring.
    # - led_pin (int): The GPIO pin connected to the NeoPixel LEDs.
    def __init__(self, num_leds, led_pin):
        self.NUM_LEDS = num_leds
        self.led_pin = Pin(led_pin)

        # Initialisiere das NeoPixel-Objekt
        self.np = neopixel.NeoPixel(self.led_pin, self.NUM_LEDS)
        self.colors = {
            "red": (255, 0, 0),    		# Rot
            "green": (0, 255, 0),    	# Grün
            "blue": (0, 0, 255),    	# Blau
            "cyan": (0, 255, 255),  	# Cyan
            "magenta": (255, 0, 255),   # Magenta
            "yellow": (255, 232, 31)	# Star Wars Yellow
            }

        self.base_color = (255, 255, 255)  # Cyan Helle Farbe
        self.clear = (0, 0, 0)
        self.brightness_stages = {
            0: 0.0,
            1: 0.04,
            2: 0.08,
            3: 0.12,
            4: 0.16,
            5: 0.2,
            6: 0.24,
            7: 0.28,
            8: 0.32,
            9: 0.36,
            10: 0.4,
            11: 0.44,
            12: 0.48,
            13: 0.52,
            14: 0.56,
            15: 0.6,
            16: 0.64,
            17: 0.68,
            18: 0.72,
            19: 0.76,
            20: 0.8,
            21: 0.84,
            22: 0.88,
            23: 0.92,
            24: 0.96,
            25: 1.0

            }
        self.brightness_led_dict = {}


    # Set a specific LED to a given color.
    #
    # Parameters:
    # - led_number (int): The index of the LED to set.
    # - color (tuple): The color to set the LED to (R, G, B).
    def set_led(self, led_number, color):
        self.np[led_number] = color
        self.np.write()

    
    # Set all LEDs to a given color.
    #
    # Parameters:
    # - color (tuple): The color to fill all LEDs with (R, G, B).
    def fill(self, color):
        for i in range(self.NUM_LEDS):
            self.np[i] = color
        self.np.write()
    
    
    # Turn off all LEDs.
    def clear_all(self,):
        for i in range(self.NUM_LEDS):
            self.np[i] = (0, 0, 0)
        self.np.write()


    # Adjust the brightness of a color by a given factor.
    #
    # Parameters:
    # - color (tuple): The original color (R, G, B).
    # - factor (float): A brightness factor between 0 and 1.
    #
    # Returns:
    # - tuple: The dimmed color (R, G, B).
    def dim_color(self, color, factor):
        val1 = color[0]
        val2 = color[1]
        val3 = color[2]
        return (int(val1 * factor), int(val2 * factor), int(val3 * factor))
    
    
    # Create a spinning light pattern for a given duration.
    #
    # Parameters:
    # - duration (int): Time in seconds to display the spinning pattern.
    def spinning_pattern(self, duration):
        start_time = time.time()
    
        # Anzahl der LEDs, die gleichzeitig leuchten sollen
        trail_length = 4

        # Helligkeitsfaktoren für die LEDs im "Schweif"
        brightness_factors = [1.0, 0.6, 0.3, 0.1] 
    
        while time.time() - start_time < duration:
            for i in range(self.NUM_LEDS):
                for j in range(trail_length):
                    led_index = (i - j) % self.NUM_LEDS
                    color = self.dim_color(self.base_color, brightness_factors[j])
                    self.set_led(led_index, color)
            
                for k in range(trail_length, self.NUM_LEDS):
                    self.np[(i - k) % self.NUM_LEDS] = (0, 0, 0)
            
                # Zeige die Änderungen an
                self.np.write()
            
                # Warte kurz, bevor die nächste LED eingeschaltet wird
                time.sleep(0.1) 

        self.clear_all()


    # Blink the LEDs on and off in the base color.
    def light_show(self):
        # Beispiel: LEDs in grün leuchten lassen
        self.fill((255, 0, 0))  # RGB für rot
        time.sleep(1)
        # Beispiel: Zweite LED grün machen (Index 1)
        self.set_led(1, (0, 255, 0))  # RGB für grün
        time.sleep(1)
        # Beispiel: Dritte LED blau machen (Index 2)
        self.set_led(2, (0, 0, 255))  # RGB für blau
        time.sleep(1)
        #Beispiel spinning mit Duration in s
        self.spinning_pattern(4)
    
    
    # Blink the LEDs on and off in the base color.
    def blink_182(self):
        self.fill(self.base_color)
        time.sleep(1)
        self.clear_all()
        
    
    # Blink the LEDs red for a given time.
    #
    # Parameters:
    # - t (int): Time in seconds to blink.
    def blink_red(self, t):
        self.fill(self.colors["red"])
        time.sleep(t)
        self.clear_all()
        
    
    # Blink the LEDs green for a given time.
    #
    # Parameters:
    # - t (int): Time in seconds to blink.
    def blink_green(self, t):
        self.fill(self.colors["green"])
        time.sleep(t)
        self.clear_all()

    
    # Blink the LEDs according to a solution pattern.
    #
    # Parameters:
    # - t_light (int): Time in seconds to keep LEDs on.
    # - t_pause (int): Time in seconds between blinks.
    # - sol (list[int]): List of LED indices to blink.
    def blink_solution(self, t_light, t_pause, sol):
        for elem in sol:
            self.set_led(elem, self.base_color)
            time.sleep(t_light)
            self.set_led(elem, self.clear)
            time.sleep(t_pause)
            
    
    # Initialize star-like LEDs with random brightness.
    def init_stars(self):
        for led in range(0, self.NUM_LEDS, 1):
            cycle_flag = 1
            idx = randint(0, 9)
            brightness = self.brightness_stages[idx]
            self.set_led(led, self.dim_color(self.base_color, brightness))
            self.brightness_led_dict[led] = brightness, cycle_flag
            
    
    # Iterate through the star brightness pattern.
    def iterate_star_brightness(self):
        for key, value in self.brightness_led_dict.items():
            cycle_flag = value[1]
            brightness = value[0]
            brightness_dict_length = len(list(self.brightness_stages.keys()))
            key_brightness = list(self.brightness_stages.keys())[list(self.brightness_stages.values()).index(brightness)]
            if cycle_flag == 1 and key_brightness < (brightness_dict_length - 1): 
                key_next_brightness = (key_brightness + 1)
            elif cycle_flag == 1 and key_brightness == (brightness_dict_length - 1):
                cycle_flag = 0
                key_next_brightness = key_brightness - 1
            elif cycle_flag == 0 and key_brightness > 0:
                key_next_brightness = key_brightness - 1
            elif key_brightness == 0:
                cycle_flag = 1
                key_next_brightness = (key_brightness + 1)
            next_brightness = self.brightness_stages[key_next_brightness]
            self.set_led(key, self.dim_color(self.base_color, next_brightness))
            self.brightness_led_dict[key] = next_brightness, cycle_flag
            
    
    # Display a star pattern with changing brightness.  
    def star_pattern(self):
        try:
            self.init_stars()
            while True:
                self.iterate_star_brightness()
                time.sleep(0.05)
        except KeyboardInterrupt:
            print("Got CTL+c")
    
        finally:
            self.clear_all()
            sys.exit()
