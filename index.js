/*-------------------------------------------
*変数定義パート
*bus_stop_num : バス停の数
*bus_stop_names : 各バス停の名前
*bus_stop_positions : バス停の位置情報を格納
*timetable : バスの時刻表(仮)
*stops : バス停インスタンス <-- render部分で毎回新たに生み出すのが無駄であるため
*ctx : Canvasの描画部
-------------------------------------------*/
document.querySelector(".switch-left-right").addEventListener("click",(event)=>{
      event.target.classList.toggle("on")
      if(event.target.classList.contains("on")){
        administrator.direction = true;// alert("right");
      }else{
        administrator.direction = false;// alert("left");
      }
      decide_timetable(administrator);
      console.log(administrator);
})

document.querySelector(".switch-holiday-weekday").addEventListener("click",(event)=>{
  event.target.classList.toggle("weekday")
  if(event.target.classList.contains("weekday")){
    administrator.holiday = false;// alert("holiday = false");
  }else{
    administrator.holiday = true;// alert("holiday = true");
  }
  decide_timetable(administrator);
  console.log(administrator);
})

const reactions = document.querySelectorAll(".reaction-item");
reactions.forEach(reaction => {
  reaction.addEventListener("click", () => {
    const late = reaction.dataset.late;
    const id = 3;
    const direction = administrator.direction;
    alert("late : " + late + " - id : " + id + " - direction : " + direction);
  })
})

const w = 500;
const h = 500;

const bus_stop_num = 25;

const bus_stop_names = ["つくばセンター","吾妻小学校前","筑波大学春日キャンパス","筑波メディカルセンター前","筑波大学病院入口","追越学生宿舎前","平砂学生宿舎前","筑波大学西","大学会館前","第一エリア前","第三エリア前","陸域環境研究センター前","農林技術センター前","一の矢学生宿舎前","大学植物見本園","TARAセンター前","筑波大学中央","大学公演","松実池","天久保三丁目","合宿所","天久保池","天久保二丁目","追越宿舎東","筑波メディカルセンター病院","筑波メディカルセンター前","筑波大学春日キャンパス","吾妻小学校前","つくばセンター"]
const bus_stop_latlng = [[36.082537, 140.112707],[36.085158, 140.109299],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[,],[36.108121, 140.104282],[36.106372, 140.105679],[36.103688, 140.106732],[36.100184, 140.105618],[36.097574, 140.106049],[36.094516, 140.106743],[36.092658, 140.106397]]

let timetable = timetable_list[0]

const holiday_list = [
  '2022-1-1',
  '2022-1-10',
  '2022-2-11',
  '2022-2-23',
  '2022-3-21',
  '2022-4-29',
  '2022-5-3',
  '2022-5-4',
  '2022-5-5',
  '2022-7-18',
  '2022-8-11',
  '2022-9-19',
  '2022-9-23',
  '2022-10-10',
  '2022-11-3',
  '2022-11-23',
]

const bus_stop_positions = make_position(); //canvas上の位置

let stops = [];
for(i=0; i<bus_stop_num; i++){
    const stop = new Stop(i);
    stops.push(stop);
}

var cvs = document.createElement("canvas");
cvs.style.backgroundColor = "rgba(2,2,2,0.2)";
cvs.width = w;
cvs.height = h;
document.getElementById("container").appendChild(cvs);
var ctx = cvs.getContext("2d");

/*-------------------------------------------
*オブジェクト定義パート
*Bus :
*Stop : 
*Admin : 
-------------------------------------------*/

function Bus(id) {
  this.id = id;
  this.timetable = [];
  this.start_stop = 0;
  this.end_stop = 0;
  this.start_time = 0;
  this.end_time = 0;
  this.remaining_time = 0;
  this.position_x = 0;
  this.position_y = 0;
  this.size = w/50*3;

  this.draw = function(ctx, x, y) {
      ctx.lineWidth = w/250;
      ctx.beginPath();
      ctx.fillStyle = "#ff3";
      ctx.strokeStyle = "#000";
      ctx.moveTo(x-this.size/2, y-this.size/2);
      ctx.lineTo(x+this.size/2, y-this.size/2);
      ctx.lineTo(x+this.size/2, y+this.size/2);
      ctx.lineTo(x-this.size/2, y+this.size/2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
  };    
}

function Stop(id) {
  var me = this;
  var [x, y] = bus_stop_positions[id];
  this.id = id;
  this.size = w/50;

  this.is_clicked = false;

  this.draw = function(ctx) {
      ctx.lineWidth = w/250;
      ctx.beginPath();
      if (administrator.user_station === id){
        ctx.fillStyle = "red";
      }else{
        ctx.fillStyle = "#3f3";
      }
      ctx.strokeStyle = "#000";
      // console.log(me.size);
      ctx.moveTo(x+me.size, y);
      ctx.arc(x, y, me.size, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.stroke();
  };
  window.addEventListener("mousedown", function(e) {
    var dx = x - e.layerX;
    var dy = y - e.layerY;
    // console.log(e.layerX, e.layerY, dx, dy, Math.sqrt(dx * dx + dy * dy), me.size);
    me.is_clicked = Math.sqrt(dx * dx + dy * dy) < me.size;
    // console.log(me.is_clicked);
    if (me.is_clicked) {
      administrator.user_station = id;
    }
  });
}

const administrator = {
  direction : true, //右回りならTrue
  user_station : 3, //バス停の識別IDが入る
  target_table :[],
  buses : [],
  holiday : false, //休日ならばtrue
};



// これら機能を一括して行う関数を作成する必要あり。
/*------------------------------------------
*関数定義パート
*load_now : 現在時刻を表示 | 返り値例 : 183010
*check_table : 現在時刻から運行しているバスのtimetableを取得(複数個ある可能性あり)＆administratorに代入
*create_buses : chek_tableで取得したtimetableをもとに運行しているバスのインスタンスを作成
*calc_bus_param : 運行中のバス情報をインスタンスに反映させる
*calc_pos : administratorの中の各バスが「画面上の」どこに居るかを計算
*calc_remaining_time : あと何分でユーザーが選択したバス停にバスインスタンスが到着するのかを計算
*decide_timetable : adiministratorのholidayとdirectionの値からtimetableを決定する。
*check_holiday : 祝日または休日ならadministratorのholidayをtrueとする関数。
*render : 描画関数
------------------------------------------*/
function load_now(){
  let now = new Date();
  let hour = now.getHours();
  let min = now.getMinutes();
  let sec = now.getSeconds();
  let time = hour*10000+min*100+sec;  //秒の仕様を後で確認する。
  return time;
}

function check_table(){  // (平日or休日)and(左or右)でif-else文書く必要あり。
  let now = load_now();
  const table = [];
  for (i=0; i<timetable.length; i++){
    if(timetable[i][0] <= now && now <= timetable[i][27]){
      table.push(timetable[i]);
    }
  }
  administrator.target_table = table;
}

function create_buses(tm){  //tm : administrater.target_table
  const buses = [];
  tm.forEach(function(value, index){
    const bus = new Bus(index);
    bus.timetable = value;
    buses.push(bus);
  });
  administrator.buses = buses;
}

// この関数はバスのパラメーターを時々刻々と更新しているので、render関数内で実行する必要がありそう。
function calc_bus_param(admin_bus) { // admin_bus : administrator.buses
  let now = load_now(); // ex)163033
  
  admin_bus.forEach(function(value, index){
    const target_ends = [];
    value.timetable.forEach(function(element){
      element = element;
      if(element>now){
        target_ends.push(element);
      }        
    });
    const target_end = target_ends[0];

    let target_start = 0;
    value.timetable.forEach(function(element){
        element = element;
        if(element<target_end){
            target_start = element;
        }   
    });

    let start_stop = 0;
    value.timetable.some(function(time, index){
      if(target_start == time){
          start_stop = index;
          return true;
      }
    });

    let end_stop = 0;
    value.timetable.some(function(time, index){
        if(target_end == time){
            end_stop = index;
            return true;
        }
    });

    value.start_stop = start_stop;
    value.end_stop = end_stop;
    value.start_time = target_start;
    value.end_time = target_end;
  });
}

function calc_pos(admin){
  var stoppos; // ここ変更が更新されていない。
  if(1){//おそらくここはバスの左右で条件分岐している。
    stoppos = bus_stop_positions.slice().reverse();
  }else{
    stoppos = bus_stop_positions;
  } 
  let now = load_now();
  admin.buses.forEach(function(bus, index){
    const total_time = bus.end_time - bus.start_time;
    const propotion = (now - bus.start_time) / total_time;
    const start_stop = stoppos[bus.start_stop];
    const end_stop = stoppos[bus.end_stop];
    const x = start_stop[0]+(end_stop[0]-start_stop[0])*propotion; // <-- ここマイナスとかあるからもう少し考えた方が
    const y = start_stop[1]+(end_stop[1]-start_stop[1])*propotion; //     良さげ。
    bus.position_x = x;
    bus.position_y = y;
  });
}

function calc_remaining_time(adm){
  const now = load_now();
  const userStation = adm.user_station;
  const buses = adm.buses;
  buses.forEach(function(bus, index){
    const arrivalTime = bus.timetable[userStation];
    const now_hour = Math.floor(now/10000);
    const now_min = Math.floor(now/100) - now_hour*100;
    const now_sec = now - now_hour*10000 - now_min*100;
    const tgt_hour = Math.floor(arrivalTime/10000);
    const tgt_min = Math.floor(arrivalTime/100) - tgt_hour*100;
    const tgt_sec = arrivalTime - tgt_hour*10000 - tgt_min*100;
    const now_time = now_hour*3600 + now_min*60 + now_sec; //現在時刻を秒で表現

    const tgt_time = tgt_hour*3600 + tgt_min*60 + tgt_sec; //到着時刻を秒で表現
    
    const arrival = tgt_time - now_time;

    // 👇ここの処理。もし通過していたらもう一本後のバスについて処理するのがよい。
    //ただし、もしバスが2台なかったら今のロジックだとうまくいかない。
    if(arrival < 0){ 
      bus.remaining_time = "バス通過";
      return;
    }
    const arrival_min = Math.floor(arrival/60);
    const arrival_sec = arrival - arrival_min*60;

    bus.remaining_time = arrival_min + "分" + arrival_sec + "秒";
  });
}

function decide_timetable(adm){
  if(adm.direction && !adm.holiday){ //平日・右回り// alert("平日・右回り");
    timetable = timetable_list[0];
  }else if(!adm.direction && !adm.holiday){//平日・左回り// alert("平日・左回り");
    timetable = timetable_list[1];
  }else if(adm.direction && adm.holiday){//休日・右回り// alert("休日・右回り");
    timetable = timetable_list[2];
  }else if(!adm.direction && adm.holiday){//休日・左回り// alert("休日・左回り");
    timetable = timetable_list[3];
  }
}

function check_holiday(){
  const dateOBJ = new Date();
  const year = dateOBJ.getFullYear();
  const month = dateOBJ.getMonth() + 1;
  const date = dateOBJ.getDate();
  const day = dateOBJ.getDay();
  const today = year + '-' + month + '-' + date;

  if(holiday_list.includes(today) || day == 0 || day == 6){
    administrator.holiday = true;
    document.querySelector(".switch-holiday-weekday").classList.remove("weekday");
  }else{
    administrator.holiday = false;
    document.querySelector(".switch-holiday-weekday").classList.add("weekday");
  }
}

function render() {
  // console.log(administrator);
  ctx.clearRect(0, 175, w, h);
  
  //map
  var r = h/10
  ctx.lineWidth = w/50;
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(w/2-h/5, 9*h/10);
  ctx.lineTo(w/2-h/5, h/5);
  //ctx.arc(中心座標x, 中心座標y, 半径, 開始角, 終了角, 反時計回りか？); 3時〜12時の位置 ctx.arc(320, 120, 80, 0, 1.5 * Math.PI);
  //開始角は3時の方角で時計回り
  // ctx.arc(w/2-h/5+r, h/5, r, Math.PI, 3*Math.PI/2, false);
  ctx.lineTo(w/2-h/5+r, h/10);
  ctx.lineTo(w/2+h/10, h/10);
  // ctx.arc(w/2+h/10, h/10+r, r, 3*Math.PI/2, 0, false);
  ctx.lineTo(w/2+h/5, h/10+r);
  ctx.lineTo(w/2+h/5, 3*h/5);
  // ctx.arc(w/2+h/5-r, 3*h/5, r, 0, Math.PI/2, false);
  ctx.lineTo(w/2+h/5-r, 3*h/5+r);
  ctx.lineTo(w/2-h/5, 3*h/5+r);
  ctx.stroke();

  //停留所インスタンスの生成
  for (var i=0; i<bus_stop_num; i++){
      stops[i].draw(ctx);
  }

  check_table();
  create_buses(administrator.target_table);
  calc_bus_param(administrator.buses);
  calc_pos(administrator);
  calc_remaining_time(administrator);

  
  ctx.fillStyle= "black";
  ctx.font = "italic bold 80pt sans-serif";
  ctx.fillText(administrator.buses[0].remaining_time, 1300, 1300);

  administrator.buses.forEach(function(bus, index){
    bus.draw(ctx, bus.position_x, bus.position_y);
  });
}

function zfill(NUM, LEN){
	return ( Array(LEN).join('0') + NUM ).slice( -LEN );
}

function make_position(){
  const positions = [];
  for (var i=0; i<25; i++) {
    var pos = [0, 0]
    if (i < 11) {
        pos[0] = w/2 - h/5
        pos[1] = h-h/10-3.5*h/50*i
    } else if (i < 15) {
        pos[0] = w/2 - h/10 + h/15*(i-11)
        pos[1] = h/10
    } else if (i < 21) {
        pos[0] = w/2 + h/5
        pos[1] = h/5 + 2*h/25*(i-15)
    } else {
        pos[0] = w/2 + h/10 - h/15*(i-21)
        pos[1] = 7*h/10
    }
    positions.push(pos);
  }
  positions.push(positions[3]);
  positions.push(positions[2]);
  positions.push(positions[1]);
  positions.push(positions[0]);
  return positions;
}

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));


function displayData(lat, lng, accu) {
  var txt = document.getElementById("gps");       // データを表示するdiv要素の取得
  txt.innerHTML = "緯度, 経度: " + lat + ", " + lng + "<br>"  // データ表示
                + "精度: "       + accu;
}

/*-------------------------------------------
*実行パート
-------------------------------------------*/

check_holiday();
decide_timetable(administrator);
check_table();
create_buses(administrator.target_table);
calc_bus_param(administrator.buses);
calc_pos(administrator);

calc_remaining_time(administrator)

render();

setInterval(render, 30);

navigator.geolocation.watchPosition( (position) => {
  var lat  = position.coords.latitude;            // 緯度を取得
  var lng  = position.coords.longitude;           // 経度を取得
  var accu = position.coords.accuracy;            // 緯度・経度の精度を取得
  displayData(lat, lng, accu);                    // displayData 関数を実行
}, (error) => {                                     // エラー処理（今回は特に何もしない）
}, {
  enableHighAccuracy: true                        // 高精度で測定するオプション
});










