from machine import ADC, Pin, I2C
from ads1x15 import ADS1115
import time


class ResistanceMeter():


    # Initialize the ResistanceMeter object.
    #
    # Parameters:
    # - id_in (int): Identifier for the resistance meter.
    # - ads (bool): True if using ADS1115 (I2C) for reading; False if using Pico's internal ADC.
    # - pin_1 (int): Pin number for the first input (required for both ADC and I2C modes).
    # - pin_2 (int): Pin number for the second input (required for both ADC and I2C modes).
    # - i2c_pin (int): I2C pin number for ADS1115 communication (used only if ads=True).
    # - measurement_count (int): Number of readings to average per measurement (default: 5).
    def __init__(self, id_in, ads, pin_1=None, pin_2=None, i2c_pin=None, measurement_count=5):
        self.id = id_in
        self.pin_1 = pin_1
        self.pin_2 = pin_2
        self.i2c_pin = i2c_pin
        self.measurement_count = measurement_count
        self.ads = ads
        
        if ads:
            self.i2c = I2C(self.i2c_pin, sda = Pin(self.pin_1), scl = Pin(self.pin_2))
            self.adc = ADS1115(self.i2c, address=0x48, gain=1)
            print(f"Resistance Meter initialized with KY-053 Board and Pins {self.pin_1} and {self.pin_2}.\nThe measurement count is {self.measurement_count}.")
        else: 
            self.adc_1 = ADC(pin_1)
            self.adc_2 = ADC(pin_2)
            print(f"Resistance Meter initialized with Pico and ADC Pins {self.pin_1} and {self.pin_2}.")

    
    # Read voltage values from Pico's internal ADC and compute the voltage difference across a bridge.
    #
    # Returns:
    # - float: The voltage difference between the two ADC pins.
    def read_voltage_pico(self):
        voltage_sum_adc_1 = 0
        voltage_sum_adc_2 = 0
        for i in range(self.measurement_count):
            voltage_sum_adc_1 += self.adc_1.read_u16()
            voltage_sum_adc_2 += self.adc_2.read_u16()

        voltage_median_adc_1 = voltage_sum_adc_1 / self.measurement_count
        voltage_median_adc_2 = voltage_sum_adc_2 / self.measurement_count

        voltage_adc_1 = ((voltage_median_adc_1 * 3.3) / 65535)
        voltage_adc_2 = ((voltage_median_adc_2 * 3.3) / 65535)

        voltage_bridge = voltage_adc_1 - voltage_adc_2
        print(f"Resistance Meter {self.id} ADC {self.pin_1}={voltage_adc_1} V")
        print(f"Resistance Meter {self.id} ADC {self.pin_2}={voltage_adc_2} V")
        print(f"Voltage in bridge: {voltage_bridge}")

        return voltage_bridge
    
    
    # Read voltage values from ADS1115 ADC channels and compute the voltage difference across two bridges.
    #
    # Returns:
    # - tuple: Voltage differences across two bridges (bridge 1 and bridge 2).
    def read_voltage_ads(self):
        
        voltage_adc_0 = self.adc.raw_to_v(self.adc.read(4, 0))
        voltage_adc_1 = self.adc.raw_to_v(self.adc.read(4, 1))
        voltage_adc_2 = self.adc.raw_to_v(self.adc.read(4, 2))
        voltage_adc_3 = self.adc.raw_to_v(self.adc.read(4, 3))
        
        voltage_bridge_1 = voltage_adc_1 - voltage_adc_0
        voltage_bridge_2 = voltage_adc_3 - voltage_adc_2
        
        print(f"Resistance Meter {self.id} ADS 0={voltage_adc_0} V")
        print(f"Resistance Meter {self.id} ADS 1={voltage_adc_1} V")
        print(f"Resistance Meter {self.id} ADS 2={voltage_adc_2} V")
        print(f"Resistance Meter {self.id} ADS 3={voltage_adc_3} V")
        print(f"Voltage in bridge 1: {voltage_bridge_1}")
        print(f"Voltage in bridge 2: {voltage_bridge_2}")
        
        return voltage_bridge_1, voltage_bridge_2
    
    
    # Check if the voltage bridge value indicates a valid or faulty measurement.
    #
    # Parameters:
    # - voltage_bridge (float): The voltage difference in the bridge.
    #
    # Returns:
    # - bool: True if the bridge voltage is within a valid range, False otherwise.
    def bridge_with_figure(self, voltage_bridge):
        if self.ads:
            if voltage_bridge >= 0.017 and voltage_bridge <= 0.019:
                return False
            elif voltage_bridge <= -0.017 and voltage_bridge >= -0.019:
                return False
            elif voltage_bridge >= 0.29 and voltage_bridge <= 0.35:
                return False
            elif voltage_bridge <= -0.29 and voltage_bridge >= -0.35:
                return False
            else:
                return True
        else:
            if voltage_bridge <= 3.3 and voltage_bridge >= 2.9:
                return False
            elif voltage_bridge >= -3.3 and voltage_bridge <= -2.9:
                return False
            else:
                return True   
    
            
    # Read voltage from either Pico ADC or ADS1115 depending on the configuration.
    #
    # Returns:
    # - float/tuple: Voltage values from the selected ADC mode.
    def read_voltage(self):
        if self.ads:
            return self.read_voltage_ads()
        else:
            return self.read_voltage_pico()
        
    
    
    # Validate the voltage reading from the ADS1115 to check if it falls within the expected range.
    #
    # Returns:
    # - tuple: Validation result in the format (id, bridge_1_valid, next_id, bridge_2_valid).
    def validate_voltage_ads(self):
        if self.ads:
            result_1, result_2 = self.read_voltage_ads()
            result_1 = round(result_1, 2)
            result_2 = round(result_2, 2)
            if (result_1 >= 0.00 and result_1 <=0.01) and (result_2 >= 0.00 and result_2 <= 0.02):
                return self.id, True, self.id + 1, True
            elif (result_1 <= 0.00 and result_1 >=-0.01) and (result_2 <= 0.00 and result_2 >= -0.02):
                return self.id, True, self.id + 1, True
            elif (result_1 >= 0.00 and result_1 <=0.01) and (result_2 <= 0.00 and result_2 >= -0.02):
                return self.id, True, self.id + 1, True
            elif (result_1 <= 0.00 and result_1 >=-0.01) and (result_2 >= 0.00 and result_2 <= 0.02):
                return self.id, True, self.id + 1, True
            elif (result_1 <= -0.01 and result_1 >=0.01) and (result_2 >= 0.00 and result_2 <= 0.02):
                return  self.id, False, self.id + 1, True
            elif (result_1 <= -0.01 and result_1 >=0.01) and (result_2 <= 0.00 and result_2 >= -0.02):
                return  self.id, False, self.id + 1, True
            elif (result_1 >= 0.00 and result_1 <=0.01) and (result_2 >= 0.02 and result_2 <= -0.02):
                return  self.id, True, self.id + 1, False
            elif (result_1 <= 0.00 and result_1 >=-0.01) and (result_2 >= 0.02 and result_2 <= -0.02):
                return  self.id, True, self.id + 1, False
            else:
                return self.id, False, self.id + 1, False


    # Validate the voltage reading from Pico's internal ADC.
    #
    # Returns:
    # - tuple: Validation result in the format (id, valid).              
    def validate_voltage_pico(self):
        if not self.ads:
            result = round(self.read_voltage_pico(), 2)
            if result != 0.00:
                return self.id, False
            else:
                return self.id, True
        
