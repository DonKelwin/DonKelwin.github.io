from machine import Pin, ADC
from time    import sleep
from math    import log

adc = ADC(1)

while True:
    adc_value = adc.read_u16()
    volt = round((3.3/65535)*adc_value,2)
    percent = int(adc_value/65535*100)
    print("Volt: "+str(volt)+" | Read value: "+str(adc_value)+" | percent: "+str(percent)+"%")
    sleep(1)