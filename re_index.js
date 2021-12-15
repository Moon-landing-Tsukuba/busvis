/*-------------------------------------------
*変数定義パート
*bus_stop_num : バス停の数
*bus_stop_names : 各バス停の名前
*bus_stop_positions : バス停の位置情報を格納
*timetable : バスの時刻表(仮)
*stops : バス停インスタンス <-- render部分で毎回新たに生み出すのが無駄であるため
*ctx : Canvasの描画部
-------------------------------------------*/
const bus_stop_num = 6;

const bus_stop_names = ["つくばセンター","吾妻小学校前","春日キャンパス","筑波メディカル前","第一エリア前","筑波大学中央"]

const bus_stop_positions = [[100,100],[200,100],[300,100],[400,100],[500,100],[600,100]];

const timetable = [
  [2300, 3300, 3500, 4400, 4600, 10400],
  [10300, 10500, 10520, 10540, 10600, 10620],
  [11100, 11100, 11100, 11100, 11100, 12200],
  [84000, 84100, 84200, 90700, 90800, 91500],
  [85500, 85900, 90200, 91700, 91800, 92500],
  [105000, 105100, 105200, 111700, 111800, 112500],
];

let stops = [];
for(i=0; i<bus_stop_num; i++){
    const stop = new Stop(i);
    stops.push(stop);
}

var cvs = document.createElement("canvas");
cvs.style.backgroundColor = "rgba(2,2,2,0.2)";
cvs.width = 700;
cvs.height = 200;
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
  var [x, y] = bus_stop_positions[id];
  this.id = id;
  this.size = 10;
  this.draw = function(ctx) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.fillStyle = "#3f3";
      ctx.strokeStyle = "#000";
      ctx.moveTo(x+this.size, y);
      ctx.arc(x, y, this.size, 0, 2*Math.PI, true);
      ctx.fill();
      ctx.stroke();
  };
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
  // const now = 858; //実際はload_now()関数を使う <--だからtimetableも秒まで書かないとダメだ。
  const table = [];
  for (i=0; i<timetable.length; i++){
    if(timetable[i][0] <= now && now <= timetable[i][5]){
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
  // var now = 85800; // <--8時58分00秒を表す。
  
  
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
  // const now = 85800
  admin_bus.forEach(function(bus, index){
    const total_time = bus.end_time - bus.start_time;
    const propotion = (now - bus.start_time) / total_time;
    const start_stop = bus_stop_positions[bus.start_stop];
    const end_stop = bus_stop_positions[bus.end_stop];
    const x = start_stop[0]+(end_stop[0]-start_stop[0])*propotion; // <-- ここマイナスとかあるからもう少し考えた方が
    const y = start_stop[1]+(end_stop[1]-start_stop[1])*propotion; //     良さげ。
    bus.position_x = x;
    bus.position_y = y;
  });
}

function render() {
  ctx.clearRect(0, 0, 500, 500);
  //map
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(50, 100);
  ctx.lineTo(650, 100);
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
