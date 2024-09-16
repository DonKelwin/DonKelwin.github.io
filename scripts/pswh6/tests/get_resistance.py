from machine import ADC
import utime

MEASUREMENT_COUNT = 5

# Measurement of voltage in Wheatstone Bridge with ADC Pins of Pico
def main():
    adc_1 = ADC(1)
    adc_2 = ADC(2)
    while True:
        print(f"ADC 1: {adc_1.read_u16()}")
        print(f"ADC 2: {adc_2.read_u16()}")
        voltage_sum_adc_1 = 0
        voltage_sum_adc_2 = 0
        for i in range(MEASUREMENT_COUNT):
            voltage_sum_adc_1 += adc_1.read_u16()
            voltage_sum_adc_2 += adc_2.read_u16()
            
        voltage_median_adc_1 = voltage_sum_adc_1 / MEASUREMENT_COUNT
        voltage_median_adc_2 = voltage_sum_adc_2 / MEASUREMENT_COUNT
        
        voltage_adc_1 = ((voltage_median_adc_1 * 3.3) / 65535)
        voltage_adc_2 = ((voltage_median_adc_2 * 3.3) / 65535)
        
        voltage_bridge = voltage_adc_1 - voltage_adc_2
        print(f"Vm (Volt) ADC 1={voltage_adc_1}")
        print(f"Vm (Volt) ADC 2={voltage_adc_2}")
        print(f"Voltage in bridge: {voltage_bridge}")
        utime.sleep(2)
        

if __name__ == "__main__":
    main()