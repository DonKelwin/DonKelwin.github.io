import time
import dfplayer_0

#instanciation player
dfp = dfplayer_0.DFPlayer(uart_id=1,tx_pin_id=4,rx_pin_id=5) #uart1

#wait some time till the DFPlayer is ready
time.sleep(5)
print(dfp.test_ram())
dfp.volume(15)
print("---------------------------------------")
print("Objet 'df' créé  : Tester vos commandes dans la console ci-dessous pour contrôler en direct")
print('df.play() pour lancer le titre 01/001.mp3 ')  
print('df.specify_play(1,2) pour lancer le titre folder=1 , file=2  ')
print('df.volume(30) pour mettre le volume au maximum')
dfp.play()
print("playing....")
time.sleep(4)
