let hours = document.querySelector('#hours');
let minutes = document.querySelector('#minutes');
let seconds = document.querySelector('#seconds');
let clock = document.querySelector('#clock')
let countdownButton = document.querySelector('#countdown-button');
let resetButton = document.querySelector('#reset-button');

function setup() {
  for (let i = 0; i < 24; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.innerText = i;
    hours.appendChild(option);
  }

  for (let i = 0; i < 60; i++) {
    [minutes, seconds].forEach(element => {
      const option = document.createElement('option');
      option.value = i;
      option.innerText = i;
      element.appendChild(option);
    })
  }
}

function Time(hours, minutes, seconds) {
  this.hours = hours;
  this.minutes = minutes;
  this.seconds = seconds;
  this.absolute = hours * 60 * 60 + minutes * 60 + seconds;
}

Time.prototype.toAbsoluteTime = function (hours, minutes, seconds) {
  return hours * 60 * 60 + minutes * 60 + seconds;
}

Time.prototype.toClockTime = function (absolute) {
  let remainder = absolute;
  let seconds = remainder % 60;
  remainder = Math.floor(remainder / 60);
  let minutes = remainder % 60;
  remainder = Math.floor(remainder / 60);
  let hours = remainder;
  return [hours, minutes, seconds];
}

Time.prototype.add = function (time) {
  if (this.absolute + time.absolute < 0) {
    return '00:00:00';
  }
  this.absolute += time.absolute;

  [this.hours, this.minutes, this.seconds] = this.toClockTime(this.absolute);
  return `${this.hours}:${this.minutes}:${this.seconds}`;
}

Time.prototype.addSeconds = function (seconds) {
  return this.add(new Time(0, 0, seconds));
}

Time.prototype.text = function () {
  return `${this.hours}:${this.minutes}:${this.seconds}`
}

setup();
let time = new Time(0, 0, 0);
let intervalID = null;

function disableInputs(boolean) {
  hours.disabled = boolean;
  minutes.disabled = boolean;
  seconds.disabled = boolean;
}

function updateClock(time) {
  clock.innerText = time.text();
  if (time.absolute === 0) {
    pauseCountdown();
    countdownButton.disabled = true;
    resetButton.disabled = false;
  } else {
    time.addSeconds(-1);
  }
}

function startCountdown(e) {
  if (time === null || time.absolute === 0) {
    time = new Time(Number(hours.value), Number(minutes.value), Number(seconds.value));
  }
  updateClock(time);
  intervalID = setInterval(updateClock, 1000, time);
  disableInputs(true);
}

function pauseCountdown(e) {
  clearInterval(intervalID);
  intervalID = null;
}

function handleCountdown(e) {
  if (intervalID === null) {  // pause or reset start
    startCountdown();
    countdownButton.innerText = 'Pause';
    resetButton.disabled = true;
  } else {  // counting
    pauseCountdown();
    countdownButton.innerText = 'Start';
    resetButton.disabled = false;
  }
}

function resetClock(e) {
  clearInterval(intervalID);
  time = new Time(Number(hours.value), Number(minutes.value), Number(seconds.value))
  clock.innerText = time.text();
  countdownButton.innerText = 'Start';
  countdownButton.disabled = false;
  disableInputs(false);
}

function handleHours(e) {
  let hours = Number(e.target.value);
  time.absolute = time.toAbsoluteTime(hours, time.minutes, time.seconds);
  [time.hours, time.minutes, time.seconds] = time.toClockTime(time.absolute);
  clock.innerText = time.text();
}

function handleMinutes(e) {
  let minutes = Number(e.target.value);
  time.absolute = time.toAbsoluteTime(time.hours, minutes, time.seconds);
  [time.hours, time.minutes, time.seconds] = time.toClockTime(time.absolute);
  clock.innerText = time.text();
}

function handleSeconds(e) {
  let seconds = Number(e.target.value);
  time.absolute = time.toAbsoluteTime(time.hours, time.minutes, seconds);
  [time.hours, time.minutes, time.seconds] = time.toClockTime(time.absolute);
  clock.innerText = time.text();
}

hours.addEventListener('change', handleHours);
minutes.addEventListener('change', handleMinutes);
seconds.addEventListener('change', handleSeconds);

countdownButton.addEventListener('click', handleCountdown);
resetButton.addEventListener('click', resetClock);