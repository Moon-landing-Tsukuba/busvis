/*-------------------------------------------
*変数定義パート
*bus_stop_num : バス停の数
*bus_stop_names : 各バス停の名前
*bus_stop_positions : バス停の位置情報を格納
*timetable : バスの時刻表(仮)
*stops : バス停インスタンス <-- render部分で毎回新たに生み出すのが無駄であるため
*ctx : Canvasの描画部
-------------------------------------------*/

const w = 500;
const h = 500;

const bus_stop_num = 25;

const bus_stop_names = ["つくばセンター","吾妻小学校前","筑波大学春日キャンパス","筑波メディカルセンター前","筑波大学病院入口","追越学生宿舎前","平砂学生宿舎前","筑波大学西","大学会館前","第一エリア前","第三エリア前","陸域環境研究センター前","農林技術センター前","一の矢学生宿舎前","大学植物見本園","TARAセンター前","筑波大学中央","大学公演","松実池","天久保三丁目","合宿所","天久保池","天久保二丁目","追越宿舎東","筑波メディカルセンター病院","筑波メディカルセンター前","筑波大学春日キャンパス","吾妻小学校前","つくばセンター"]

const bus_stop_positions = make_position();

// const timetable = [
//   [2300, 3300, 3500, 4400, 4600, 10400],
//   [10300, 10500, 10520, 10540, 10600, 10620],
//   [11100, 11100, 11100, 11100, 11100, 12200],
//   [84000, 84100, 84200, 90700, 90800, 91500],
//   [85500, 85900, 90200, 91700, 91800, 92500],
//   [105000, 105100, 105200, 111700, 111800, 112500],
// ];
const timetable = [];

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
  this.size = 30;

  this.draw = function(ctx, x, y) {
      ctx.lineWidth = 2;
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
  me.id = id;
  me.size = 10;

  me.is_clicked = false;

  me.draw = function(ctx) {
      ctx.lineWidth = 2;
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
};


/*------------------------------------------
*関数定義パート
*load_now : 現在時刻を表示 | 返り値例 : 183010
*check_table : 現在時刻から運行しているバスのtimetableを取得(複数個ある可能性あり)＆administratorに代入
*create_buses : chek_tableで取得したtimetableをもとに運行しているバスのインスタンスを作成
*calc_bus_param : 運行中のバス情報をインスタンスに反映させる
*calc_pos : administratorの中の各バスがどこに居るかを計算
*render : 描画関数
------------------------------------------*/
function load_now(){
  var now = new Date();
  var hour = now.getHours();
  var min = now.getMinutes();
  var sec = now.getSeconds();
  var time = hour*10000+min*100+sec;  //秒の仕様を後で確認する。
  return time;
}

function check_table(){
  let now = load_now();
  // console.log(now);
  // const now = 142300; //実際はload_now()関数を使う <--だからtimetableも秒まで書かないとダメだ。
  const table = [];
  for (i=0; i<timetable.length; i++){
    if(timetable[i][0] <= now && now <= timetable[i][27]){
      table.push(timetable[i]);
    }
  }
  administrator.target_table = table;
}

function create_buses(tm){
  const buses = [];
  tm.forEach(function(value, index){
    const bus = new Bus(index);
    bus.timetable = value;
    buses.push(bus);
  });
  administrator.buses = buses;
}

function calc_bus_param(admin_bus) {
  let now = load_now(); //ここでは秒変換されていない。ex)163033
  // var now = 142300; // <--8時58分00秒を表す。
  
  
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

function calc_pos(admin_bus){
  let now = load_now();
  // const now = 142300
  admin_bus.forEach(function(bus, index){
    const total_time = bus.end_time - bus.start_time;
    const propotion = (now - bus.start_time) / total_time;
    const start_stop = bus_stop_positions[bus.start_stop];
    const end_stop = bus_stop_positions[bus.end_stop];
    // console.log(bus.start_stop);
    const x = start_stop[0]+(end_stop[0]-start_stop[0])*propotion; // <-- ここマイナスとかあるからもう少し考えた方が
    const y = start_stop[1]+(end_stop[1]-start_stop[1])*propotion; //     良さげ。
    bus.position_x = x;
    bus.position_y = y;
  });
}

function render() {
  // console.log(administrator);
  ctx.clearRect(0, 0, 500, 500);
  
  //map
  var r = h/10
  ctx.lineWidth = 10;
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
  calc_pos(administrator.buses);

  administrator.buses.forEach(function(bus, index){
    bus.draw(ctx, bus.position_x, bus.position_y);
  });
}

function zfill(NUM, LEN){
	return ( Array(LEN).join('0') + NUM ).slice( -LEN );
}

function make_timetable() {
  const timetable = [];
  var interval_rightlot = [0, 30, 30, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 30, 30, 60, 60, 60, 60, 60, 60, 60, 60, 60];
  var interval_leftlot = interval_rightlot.slice().reverse();
  var interval_rightlot_acc = [];
  var interval_leftlot_acc = [];
  var sum = 0;
  for (var i=0; i<interval_rightlot.length; i++){
      sum += interval_rightlot[i];
      interval_rightlot_acc.push(sum);
  }
  var sum = 0;
  for (var i=0; i<interval_leftlot.length; i++){
      sum += interval_leftlot[i];
      interval_leftlot_acc.push(sum);
  }
  // console.log(interval_rightlot_acc);
  var timetable_rightlot = [];
  var timetable_leftlot = [];
  for (var i=0; i<interval_rightlot.length; i++) {
      var timetable_rightlot_stop = []
      plus = interval_rightlot_acc[i];
      for (var houri=9; houri<21; houri++) {
          for (var mini=0; mini<60; mini+=20) {
              time = houri*60*60 + mini*60 + plus;
              var hour = Math.floor(time/3600);
              hour = zfill(hour, 2)
              var min = Math.floor((time - hour*3600)/60);
              min = zfill(min, 2)
              var sec = time - hour*3600 - min*60;
              sec = zfill(sec, 2)
              timetable_rightlot_stop.push(Number("" + hour + min + sec));
          }
      }
      // console.log(timetable_rightlot_stop)
      timetable_rightlot.push(timetable_rightlot_stop);
      
  }
  // console.log(timetable_rightlot)
  for (var i=0; i<interval_leftlot.length; i++) {
      var timetable_leftlot_stop = []
      plus = interval_leftlot_acc[i];
      for (var houri=9; houri<21; houri++) {
          for (var mini=0; mini<60; mini+=20) {
              time = houri*60*60 + mini*60 + plus;
              var hour = Math.floor(time/3600);
              hour = zfill(hour, 2)
              var min = Math.floor((time - hour*3600)/60);
              min = zfill(min, 2)
              var sec = time - hour*3600 - min*60;
              sec = zfill(sec, 2)
              timetable_leftlot_stop.push(Number("" + hour + min + sec));
          }
      }
      timetable_leftlot.push(timetable_leftlot_stop);
  }
  timetable.push(timetable_rightlot);
  timetable.push(timetable_leftlot);

  return timetable;
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

/*-------------------------------------------
*実行パート
-------------------------------------------*/

console.log(administrator);

check_table();
create_buses(administrator.target_table);
calc_bus_param(administrator.buses);
calc_pos(administrator.buses);

var timetable_both = make_timetable();
var timetable_rightlot = transpose(timetable_both[0]);
var timetable_leftlot = transpose(timetable_both[1])
for (var i=0; i<timetable_rightlot.length; i++) {
    timetable.push(timetable_rightlot[i]);
}

render();

setInterval(render, 30);

