class PC {
   "ID" = 0;
   "WireIsIdleForMe" = true;
   "ImSending" = false;
   "ImReceiving" = false;
   "TimeToSendForMeter" = 0;
   "FirstBitArivesForMeter" = 0;
   "SendingComplete" = true;
   "Paused" = false;
   "CTSArrived" = false;
   "blocked" = false;
   "startedSending" = false;
   "collision" = false;
   "nWith" = 0;
   "n" = 1;
   "RTSRightArrived" = false;
   "RTSLeftArrived=" = false;
   constructor(meter, byte, Mbit) {
      this.meter = meter;
      this.byte = byte;
      this.Mbit = Mbit;
   }


}

let Singleton = (function () {
   let instance;

   function createInstance() {
      let array = new Array(3);
      return array;
   }

   return {
      getInstance: function () {
         if (!instance) {
            instance = createInstance();
         }
         return instance;
      }
   };
})();





function initialize(meter, byte, Mbit, form) {
   if (meter == 0 || byte == 0 || Mbit == 0) {
      alert("Fill in the empty fields!")
   }
   else {
      document.getElementById("checkbox-1").disabled = true;
      if ((1 * (40 * meter / 200000000) * Mbit * 1000000) > (byte * 8)) {
         alert("Minimum frame size too small! You will need at least " + (1 * (40 * meter / 200000000) * Mbit * 1000000) / 8 + " byte  " + (1 * (40 * meter / 200000000) * Mbit * 1000000) + "(bit) with your settings (to send to every node)!")
      }
      else {
         console.log("checkbox checked is ", form.RTS.checked);
         document.getElementById("play").disabled = true;
         document.getElementById("playWithout").disabled = true;
         const pcOne = new PC(40 * meter, byte, Mbit);
         pcOne.ID = 1;
         pcOne.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (40 * meter / 300000000);
         pcOne.FirstBitArivesForMeter = 40 * meter / 300000000;
         if (form.RTS.checked == true) {
            pcOne.RTS = true;
         }

         const pcTwo = new PC(4 * meter, byte, Mbit);
         pcTwo.ID = 2;
         pcTwo.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (40 * meter / 300000000);
         pcTwo.FirstBitArivesForMeter = 40 * meter / 300000000;
         if (form.RTS.checked == true) {
            pcTwo.RTS = true;
         }

         const router = new PC(4 * meter, byte, Mbit);
         router.ID = 3;
         router.TimeToSendForMeter = ((byte * 8) / (Mbit * 1000000)) + (40 * meter / 300000000);
         router.FirstBitArivesForMeter = 40 * meter / 300000000;
         if (form.RTS.checked == true) {
            router.RTS = true;
         }

         Singleton.getInstance[0] = pcOne;
         Singleton.getInstance[1] = pcTwo;
         Singleton.getInstance[2] = router;
         console.log("RTS Addition on Router is active: " + router.RTS)
         if (pcOne.RTS == true) {
            gsap.fromTo('#withRTS', { opacity: 0 }, { opacity: 1, duration: 1, y: -150 });
         } else {
            gsap.fromTo('#withoutRTS', { opacity: 0 }, { opacity: 1, duration: 1, y: -730 });
            gsap.fromTo('#withRTS', { opacity: 0 }, { opacity: 0, duration: 1, y: 250 });
         }
      }
   }
}

function startNetwork1() {
   let firstPC = Singleton.getInstance[0];
   let router = Singleton.getInstance[2];
   let rightPC = Singleton.getInstance[1];
   if (firstPC.ID != undefined) {
      sending(firstPC, router, rightPC);
   }
}

function startNetwork2() {
   let router = Singleton.getInstance[2];
   let secondPC = Singleton.getInstance[1];
   let leftPC = Singleton.getInstance[0];
   if (secondPC.ID != undefined) {
      sending(secondPC, router, leftPC);
   }
}



function sending(from, router, to) {
   if (from.RTS == true) {
      sendingWithRTS(from, router, to);
   } else {
      sendingWithoutRTS(from, router, to, 1);
   }
}

function sendingWithRTS(from, router, to) {
   var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
   if(from.ID==1){
      t3.to('#POILeftWaiterWith', { opacity: 0, duration: 0 });
      t3.to('#left_backoffWith', { opacity: 0, duration: 0 }, "<");
   }else{
      t3.to('#POIRightWaiterWith', { opacity: 0, duration: 0 });
      t3.to('#right_backoffWith', { opacity: 0, duration: 0 }, "<");
   }
   console.log("PC " + from.ID + ": Button pressed" + Math.floor(Date.now() / 1000));
   if (from.SendingComplete) {
      from.SendingComplete = false;
      console.log("PC " + from.ID + ": i want to send with RTS/CTS Addition" + Math.floor(Date.now() / 1000));
      handleWithRTS(from, router, to);
   }
}

async function sendingWithoutRTS(from, router, to) {
   if (from.SendingComplete) {
      from.collision = false;
      console.log("PC " + from.ID + ": wants to send without RTS/CTS Addition");
      from.SendingComplete = false;
      let r = BinaryPotentialBackoff(from, from.n);
      await WaitingBinaryPotentialBackoff(from, r[0], r[1], r[2]);
      await pause(from);
      animateWithoutRTS(from, to);
   } else {
      console.log("PC " + from.ID + ": i must finish my sending beforehand");
   }
}

function handleWithRTS(from, router, to) {
   if (!from.CTSArrived) {
      animateWaitingRTS(from);
      var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
      if (from.ID == 1) {
         t3.fromTo('.leftRTS', { opacity: 0.5, x: 0, width: 15 }, { opacity: 0.5, onComplete: RTSArrived, onCompleteParams: [from, router], ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: 403 });
         t3.fromTo('.leftRTS', { opacity: 0.5 }, { duration: 0.5, x: 453, width: 30 , onComplete: continueWith, onCompleteParams: [from, to, router]} );
         t3.to('.leftRTS', { opacity: 0 });
      } else {
         t3.fromTo('.rightRTS', { opacity: 0.5, x: 0, width: 15 }, { opacity: 0.5, onComplete: RTSArrived, onCompleteParams: [from, router], ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: -403 });
         t3.fromTo('.rightRTS', { opacity: 0.5 }, { duration: 0.5, x: -453, width: 30 , onComplete: continueWith, onCompleteParams: [from, to, router]} );
         t3.to('.rightRTS', { opacity: 0 });
      }

   }
}

function RTSArrived(from, router) {
   if (from.ID == 1) {
      router.RTSLeftArrived = true;
      console.log("Router: left RTS reached me ");
   } else {
      router.RTSRightArrived = true;
      console.log("Router: left RTS reached me ");
   }
}

function continueWith(from, to, router) {
   if (router.RTSLeftArrived && router.RTSRightArrived) {
      gsap.fromTo('#withRTS', {}, { duration: from.FirstBitArivesForMeter * 200001, onComplete: handleCollision, onCompleteParams: [from, to, router] });
   } else {
      var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
      if (!from.blocked) {
         to.blocked = true;
         if (from.ID == 1) {
            router.RTSLeftArrived = false;
            t3.to('#left_CTS_POI', { opacity: 1 }, "<");
         } else {
            router.RTSRightArrived = false;
            t3.to('#right_CTS_POI', { opacity: 1 }, "<");
         }
         t3.fromTo('.leftCTS', { opacity: 0.5, x: 0 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: -400, overwrite: true, onComplete: CTSArrived, onCompleteParams: [from, to, router, t3] }, "<");
         t3.fromTo('.rightCTS', { opacity: 0.5, x: 0 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: 400, overwrite: true }, "<");
         t3.to('.rightCTS', { opacity: 0 }, ">");
         t3.to('.leftCTS', { opacity: 0 }, "<");
         if (from.ID == 1) {
            t3.to('#left_CTS_POI', { opacity: 0 }, "<");
            t3.to('#left_RTS_POI', { opacity: 0 }, "<");
            t3.to('#right_RTS_POI', { opacity: 0 }, "<");
            t3.to('#left_sending_POI', { opacity: 1 }, "<");
            t3.to('#right_Blocked_POI', { opacity: 1 }, "<");
            t3.fromTo('.leftbox', { x: 90, width: 0, opacity: 0.5 }, { delay: 0.5, opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, width: 400 }, "<");
            t3.fromTo('.leftbox', { x: 90, opacity: 0.5 }, { opacity: 0.5, ease: "none", delay: from.TimeToSendForMeter * 200001, x: 490, duration: from.FirstBitArivesForMeter * 200001, width: 0 }, "<");
            t3.to('#left_sending_POI', { opacity: 0 }, "<");
            t3.fromTo('.leftACK', { opacity: 0.5, x: 0 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: -400, overwrite: true });
            t3.fromTo('.rightACK', { opacity: 0.5, x: 0 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: 400, overwrite: true }, "<");
            t3.to('.rightACK', { opacity: 0 });
            t3.to('.leftACK', { opacity: 0 }, "<");
            t3.to('#right_Blocked_POI', { opacity: 0, onComplete: NetWorkFreeAgain, onCompleteParams: [to, from, router], duration: 0 }, "<");
         } else {
            t3.to('#right_CTS_POI', { opacity: 0 }, "<");
            t3.to('#right_RTS_POI', { opacity: 0 }, "<");
            t3.to('#left_RTS_POI', { opacity: 0 }, "<");
            t3.to('#right_sending_POI', { opacity: 1 }, "<");
            t3.to('#left_Blocked_POI', { opacity: 1 }, "<");
            t3.fromTo('.rightbox', { x: -175, width: 0, opacity: 0.5 }, {delay: 0.5, opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, width: 400 }, "<");
            t3.fromTo('.rightbox', { x: -175, opacity: 0.5 }, { opacity: 0.5, ease: "none", delay: from.TimeToSendForMeter * 200001, x: -575, duration: from.FirstBitArivesForMeter * 200001, width: 0 }, "<");
            t3.to('#right_sending_POI', { opacity: 0 }, "<");
            t3.fromTo('.leftACK', { opacity: 0.5, x: 0 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: -400, overwrite: true });
            t3.fromTo('.rightACK', { opacity: 0.5, x: 0 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: 400, overwrite: true }, "<");
            t3.to('.rightACK', { opacity: 0 });
            t3.to('.leftACK', { opacity: 0 }, "<");
            t3.to('#left_Blocked_POI', { opacity: 0, onComplete: NetWorkFreeAgain, onCompleteParams: [to, from, router], duration: 0 }, "<");
         }
      
      }
   }
}

function CTSArrived(from, to, router, t3) {
   to.CTSArrived = true;
   to.ImReceiving=true;
   console.log("PC " + to.ID + ": CTS Arrived: ");
}

async function handleCollision(from,to, router){
   var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });  
   if (from.ID==1){
      t3.to('#left_RTS_POI', { opacity: 0 });
      t3.fromTo('#left_TimeoutedWith',{ opacity:1 }, { opacity: 0,  duration: 4}, "<");
   }else{
      t3.to('#right_RTS_POI', { opacity: 0 });
      t3.fromTo('#right_TimeoutedWith',{ opacity:1 }, { opacity: 0,  duration: 4}, "<");
   }
   gsap.fromTo('#withRTS', {}, { duration: from.FirstBitArivesForMeter * 200001, onComplete: continueCollision, onCompleteParams: [from, to, router] });
}

async function continueCollision (from, to, router) {
   from.nWith+=1;
   to.CTSArrived = false;
   router.RTSLeftArrived = false;
   router.RTSRightArrived = false;
   to.blocked = false;
   console.log("PC " + from.ID + ": collision ");
   from.SendingComplete = true;
   to.SendingComplete = true;
   to.ImReceiving=false;
   let r = BinaryPotentialBackoff(from, from.nWith);
   await WaitingBinaryPotentialBackoffWithRTS(from, r[0], r[1], r[2]);
   sendingWithRTS(from, router, to);
}

function animateWithoutRTS(from, to) {
   var t3 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
   from.ImSending = true;
   console.log("PC " + from.ID + ": i send now");
   if (from.ID == 1) {
      t3.to('#POILeftWaiter', { opacity: 0, duration: 0 });
      t3.to('#left_backoff', { opacity: 0, duration: 0 }, "<");
      t3.fromTo('.leftboxWithout', { x: 90, width: 0, opacity: 0.5 }, { opacity: 0.5, onComplete: firstBit, onCompleteParams: [to, from], ease: "none", duration: from.FirstBitArivesForMeter * 200001, width: 390 }, "<");
      t3.fromTo('.leftboxWithout', { x: 90, opacity: 0.5 }, { opacity: 0.5, onComplete: lastBit, onCompleteParams: [to, from], ease: "none", delay: from.TimeToSendForMeter * 200001, x: 480, duration: from.FirstBitArivesForMeter * 200001, width: 0 }, "<");
   } else {
      t3.to('#POIRightWaiter', { opacity: 0, duration: 0 });
      t3.to('#right_backoff', { opacity: 0, duration: 0 }, "<");
      t3.fromTo('.rightboxWithout', { x: -95, width: 0, opacity: 0.5 }, { opacity: 0.5, onComplete: firstBit, onCompleteParams: [to, from], ease: "none", duration: from.FirstBitArivesForMeter * 200001, width: 390 }, "<");
      t3.fromTo('.rightboxWithout', { x: -95, opacity: 0.5 }, { opacity: 0.5, onComplete: lastBit, onCompleteParams: [to, from], ease: "none", delay: from.TimeToSendForMeter * 200001, x: -485, duration: from.FirstBitArivesForMeter * 200001, width: 0 }, "<");
   }
}

function firstBit(to, from) {
   to.ImReceiving = true;
   if (to.ImSending) {
      from.collision = true;
      console.log("PC " + from.ID + ": collision, it is the " + from.n + " collision");
   }
}

async function lastBit(to, from) {
   from.ImSending = false;
   if (from.collision) {
      await waitTimeout(from, to);
   } else {
      await answerAck(from, to);
   }
}

async function waitTimeout(from, to) {
   to.ImReceiving = false;
   if (from.ID == 1) {
      gsap.to('#POILeftWaiter', { opacity: 0, duration: 0 });
   } else {
      gsap.to('#POIRightWaiter', { opacity: 0, duration: 0 });
   }
   console.log("PC " + from.ID + ": i wait for ACK: ");
   var t1 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
   t1.fromTo('#start', {}, { duration: from.FirstBitArivesForMeter * 200000 });
   if (from.ID == 1) {
      t1.to('#left_Timeouted', { opacity: 1, duration: 0 });
   } else {
      t1.to('#right_Timeouted', { opacity: 1, duration: 0 });
   }
   t1.fromTo('#start', {}, { duration: from.FirstBitArivesForMeter * 200000, onComplete: afterTimeout, onCompleteParams: [to, from] });
}

async function afterTimeout(to, from) {
   if (from.ID == 1) {
      gsap.to('#left_Timeouted', { opacity: 0, duration: 0 });
   } else {
      gsap.to('#right_Timeouted', { opacity: 0, duration: 0 });
   }
   console.log("PC " + from.ID + ": i timeouted: ");
   from.SendingComplete = true;
   sendingWithoutRTS(from, from, to, from.n += 1);
}

async function answerAck(from, to) {
   var t4 = gsap.timeline({ repeat: 0, repeatDelay: 0 });
   from.collision = false;
   console.log("PC " + to.ID + ": sending ACK: ");
   to.ImReceiving = false;
   if (from.ID == 1) {
      t4.fromTo('.rightACKWithout', { x: 0, opacity: 0.5 }, { opacity: 0.5, onComplete: sendingComplete, onCompleteParams: [from, to], ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: -385 }, "<");
      t4.to('.rightACKWithout', { opacity: 0, duration: 0 });
   } else {
      t4.fromTo('.leftACKWithout', { x: 25, opacity: 0.5 }, { opacity: 0.5, onComplete: sendingComplete, onCompleteParams: [from, to], ease: "none", duration: from.FirstBitArivesForMeter * 200001, x: 405 }, "<");
      t4.to('.leftACKWithout', { opacity: 0, duration: 0 });
   }
}

async function sendingComplete(from, to) {
   if (from.ID == 1) {
      gsap.fromTo('#left_check_POI_Without', { opacity: 1 }, { opacity: 0, duration: 3 });
   } else {
      gsap.fromTo('#right_check_POI_Without', { opacity: 1 }, { opacity: 0, duration: 3 });
   }
   from.SendingComplete = true;
   from.n = 1;
   console.log("PC " + from.ID + ":finished Sending");
}


async function WaitingBinaryPotentialBackoffWithRTS(from, r, i, maxValue) {
   await waitAndListenForDataWithRTS((Math.floor(Date.now() / 1000)), (Math.floor(Date.now() / 1000) + r * 200000), from, r, i, maxValue);
}


async function waitAndListenForDataWithRTS(startTime, endTime, from, r, i, maxValue) {
   if (from.ID == 1) {
      const elem = document.getElementById("left_RandomValueWith");
      elem.innerHTML = i;
      const max = document.getElementById("left_max_value_range_With");
      max.innerHTML = maxValue;
      gsap.to('#left_backoffPauseWith', { opacity: 0, duration: 0 });
      gsap.to('#POILeftWaiterWith', { opacity: 1, duration: 0 });
      gsap.to('#left_backoffWith', { opacity: 1, duration: 0 });
   } else {
      const elem = document.getElementById("right_RandomValueWith");
      elem.innerHTML = i;
      const max = document.getElementById("right_max_value_range_With");
      max.innerHTML = maxValue;
      gsap.to('#right_backoffPauseWith', { opacity: 0, duration: 0 });
      gsap.to('#POIRightWaiterWith', { opacity: 1, duration: 0 });
      gsap.to('#right_backoffWith', { opacity: 1, duration: 0 });
   }
   var timeBeforePause = Math.floor(Date.now() / 1000);
   await pause(from);
   var pauseTime = Math.floor(Date.now() / 1000) - timeBeforePause;
   if ((!from.ImReceiving) && (Math.floor(Date.now() / 1000) < endTime + pauseTime)) {
      await sleepPropagationTime(5);
      await waitAndListenForDataWithRTS(startTime, endTime + pauseTime, from, r, i, maxValue);
   }
   if (from.ImReceiving) {
      await pauseBackOffTimeWithRTS(Math.floor(Date.now() / 1000), endTime + pauseTime, from, r, i, maxValue, Math.floor(Date.now() / 1000))
   }
}

async function pauseBackOffTimeWithRTS(startTime, endTime, from, r, i, maxValue, startPausingTime ) {
   if (from.ID == 1) {
      gsap.to('#left_backoffWith', { opacity: 0, duration: 0 });
      gsap.to('#left_backoffPauseWith', { opacity: 1, duration: 0 });

   } else {
      gsap.to('#right_backoffWith', { opacity: 0, duration: 0 });
      gsap.to('#right_backoffPauseWith', { opacity: 1, duration: 0 });
   }
   await pause(from);
   if ((from.ImReceiving)) {
      await sleepPropagationTime(5);
      await pauseBackOffTimeWithRTS(startTime, endTime, from, r, i, maxValue);
   }
   var endPausingTime = Math.floor(Date.now() / 1000) - startPausingTime;
   console.log("PC " + from.ID + ": i paused my backoff for  " + endPausingTime + " seconds. " + Math.floor(Date.now() / 1000));
   await waitAndListenForDataWithRTS(Math.floor(Date.now() / 1000), endTime + endPausingTime, from, r, i, maxValue);
}



async function WaitingBinaryPotentialBackoff(from, r, i , maxValue) {
   await waitAndListenForData((Math.floor(Date.now() / 1000)), (Math.floor(Date.now() / 1000) + r * 200000), from, r, i, maxValue);
}


async function waitAndListenForData(startTime, endTime, from, r, i, maxValue) {
   if (from.ID == 1) {
      const elem = document.getElementById("left_RandomValue");
      elem.innerHTML = i;
      const max = document.getElementById("left_max_value_range");
      max.innerHTML = maxValue;
      gsap.to('#left_backoffPause', { opacity: 0, duration: 0 });
      gsap.to('#POILeftWaiter', { opacity: 1, duration: 0 });
      gsap.to('#left_backoff', { opacity: 1, duration: 0 });
   } else {
      const elem = document.getElementById("right_RandomValue");
      elem.innerHTML = i;
      const max = document.getElementById("right_max_value_range");
      max.innerHTML = maxValue;
      gsap.to('#right_backoffPause', { opacity: 0, duration: 0 });
      gsap.to('#POIRightWaiter', { opacity: 1, duration: 0 });
      gsap.to('#right_backoff', { opacity: 1, duration: 0 });
   }
   var timeBeforePause = Math.floor(Date.now() / 1000);
   await pause(from);
   var pauseTime = Math.floor(Date.now() / 1000) - timeBeforePause;
   if ((!from.ImReceiving) && (Math.floor(Date.now() / 1000) < endTime + pauseTime)) {
      await sleepPropagationTime(5);
      await waitAndListenForData(startTime, endTime + pauseTime, from, r, i, maxValue);
   }
   if (from.ImReceiving) {
      await pauseBackOffTime(Math.floor(Date.now() / 1000), endTime + pauseTime, from, r, i, maxValue, Math.floor(Date.now() / 1000))
   }
}

async function pauseBackOffTime(startTime, endTime, from, r, i, maxValue, startPausingTime) {
   if (from.ID == 1) {
      gsap.to('#left_backoff', { opacity: 0, duration: 0 });
      gsap.to('#left_backoffPause', { opacity: 1, duration: 0 });

   } else {
      gsap.to('#right_backoff', { opacity: 0, duration: 0 });
      gsap.to('#right_backoffPause', { opacity: 1, duration: 0 });
   }
   await pause(from);
   if ((from.ImReceiving)) {
      await sleepPropagationTime(5);
      await pauseBackOffTime(startTime, endTime , from, r, i, maxValue);
   }
   var endPausingTime = Math.floor(Date.now() / 1000) - startPausingTime;
   console.log("PC " + from.ID + ": i paused my backoff for  " + endPausingTime + " seconds. " + Math.floor(Date.now() / 1000));
   await waitAndListenForData(Math.floor(Date.now() / 1000), endTime + endPausingTime, from, r, i, maxValue);
}

function BinaryPotentialBackoff(from, n) {
   let k = Math.min(n, 10)
   let i = Math.round(Math.random() * (Math.pow(2, k) - 1));
   let r = [(2 * i * (2 * (from.FirstBitArivesForMeter))), i, (Math.pow(2, k) - 1)]; //!!!!!
   console.log("PC " + from.ID + ": i rolled  " + i + " and i must wait  " + r[0] + " seconds " + Math.floor(Date.now() / 1000));
   console.log("PC " + from.ID + ": my range is from 0 to " + (Math.pow(2, k) - 1) + " Time:" + Math.floor(Date.now() / 1000));
   return r;
}

function animateLeftToRight(from) {
   gsap.fromTo('.leftbox', { x: 90, width: 0, opacity: 0.5 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, width: 400, overwrite: true });

}

function animateRightToLeft(from) {
   gsap.fromTo('.rightbox', { x: -175, width: 0, opacity: 0.5 }, { opacity: 0.5, ease: "none", duration: from.FirstBitArivesForMeter * 200001, width: 400, overwrite: true });

}

async function animateWaitingRTS(from) {
   console.log("PC " + from.ID + ": sending RTS");
   if (from.ID == 1) {
      gsap.to('#left_RTS_POI', { opacity: 1 });
   } else {
      gsap.to('#right_RTS_POI', { opacity: 1 });
   }
}


function stopping() {
   document.getElementById("pause").disabled = true;
   document.getElementById("pauseWithout").disabled = true;
   document.getElementById("play").disabled = false;
   document.getElementById("playWithout").disabled = false;
   Singleton.getInstance[0].Paused = true;
   Singleton.getInstance[1].Paused = true;
   Singleton.getInstance[2].Paused = true;
   gsap.globalTimeline.pause();
}

function resume() {
   document.getElementById("pause").disabled = false;
   document.getElementById("pauseWithout").disabled = false;
   document.getElementById("play").disabled = true;
   document.getElementById("playWithout").disabled = true;
   Singleton.getInstance[0].Paused = false;
   Singleton.getInstance[1].Paused = false;
   Singleton.getInstance[2].Paused = true;
   gsap.globalTimeline.play();
}

async function pause(from) {
   if (from.Paused) {
      console.log("Es ist pausiert " + (Math.floor(Date.now() / 1000)));
      await sleepPropagationTime(10);
      await pause(from);
   }
}


function NetWorkFreeAgain(to, from, router) {
   to.CTSArrived = false;
   router.RTSLeftArrived = false;
   router.RTSRightArrived = false;
   to.blocked = false;
   console.log("PC " + to.ID + ": Network blocked: " + to.blocked);
   console.log("PC " + from.ID + ": sending complete " + Math.floor(Date.now() / 1000));
   from.SendingComplete = true;
   to.SendingComplete = true;
   to.ImReceiving=false;
   from.nWith=0;
   if (from.ID == 1) {
      gsap.fromTo('#left_check_POI', { opacity: 1 }, { opacity: 0, duration: 3 });
   } else {
      gsap.fromTo('#right_check_POI', { opacity: 1 }, { opacity: 0, duration: 3 });
   }
}

async function transMissionDelay(to, endTime) {
   var timeBeforePause = Math.floor(Date.now() / 1000);
   await pause(to);
   var pauseTime = Math.floor(Date.now() / 1000) - timeBeforePause;
   if ((Math.floor(Date.now() / 1000) < endTime + pauseTime)) {
      await sleepPropagationTime(20);
      await transMissionDelay(to, endTime + pauseTime);
   }
}

function sleepPropagationTime(ms) {
   return new Promise(resolve => setTimeout(resolve, ms))
}
