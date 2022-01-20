<?php

define('DSN', 'mysql:host=kutnpvrhom7lki7u.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306;dbname=lcgyul56yfcheas3;charset=utf8mb4');
define('DB_USER', 'qniv4bnn438d3vf3');
define('DB_PASS', 'tpcjvhz7crsilp40');

try {
  $pdo = new PDO(
    DSN,
    DB_USER,
    DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]
  );
} catch (PDOException $e) {
  echo $e->getMessage();
  exit;
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
  //ここに日付が変わったらときのUPDATE処理を書く

  if(isset($_POST['id']) && isset($_POST['direction'])){
    $user_station =$_POST['id'];
    $direction = $_POST['direction'];

    $sql = "SELECT id, ".$direction." FROM latetimes WHERE id = ".$user_station;
    $stmt = $pdo->query($sql);
    $result = $stmt->fetch();  //PDO::FETCH_ASSOCを指定すれば配列形式で返ってくる。ex) $result['id']のように指定。
    echo($result->$direction);
    exit;
  }
  if(isset($_POST['fetchid']) && isset($_POST['direct']) && isset($_POST['latetime'])){
    $fetchid = $_POST['fetchid'];
    $direct = $_POST['direct'];
    $receive_time = $_POST['latetime'];

    $stmt = $pdo->query("UPDATE latetimes SET $direct = $receive_time WHERE id = $fetchid");
    $stmt->execute();
  }
}

function getLate($pdo)
{
  $stmt = $pdo->query("SELECT * FROM latetimes ");
  $lates = $stmt->fetchAll();
  return $lates;
}

$lates = getLate($pdo);

?>


<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Hello World</title>
        <link rel="stylesheet" href="style.css">
    </head>
    <body>
        <header class="page-header wrapper" id='header-id'>
            <div class="inner-box">
                <div class="font-biggest">
                    <p id="user-station">第3エリア前</p>
                </div>
                <div class="font-departure">
                    <p id="departure-time">○○分発</p>
                </div>
                <div class="flex-container">
                    <div id="remaining-time-box">
                        <div class="font-smaller">
                            <p>次の発車まであと</p>
                        </div> 
                        <div class="font-bigger">
                            <p id="remaining-time">22分23秒</p>
                        </div>
                    </div>
                    <div id="expected-time-box">
                        <div class="font-bigger">
                            <p id="late-time-line"><span id="late-time">4</span>分の遅れ予想</p>
                        </div>
                        <div class="font-smaller">
                            <p id="expected-time">あと26分23秒</p>
                        </div>
                    </div>
                </div>
            </div> 
        </header>
        
        <div class="user-reaction-box" id="user-reaction">
            <ul>
                <li class="reaction-item" data-late="0">遅れなし</li>
                <li class="reaction-item" data-late="2">2分遅れ</li>
                <li class="reaction-item" data-late="4">4分遅れ</li>
            </ul>
        </div>

        <div id="container" class="canvas-box">
            <canvas id="bus-map"></canvas>
        </div>

        <div class="btn-box wrapper">
            <div class="btn-container">
                <div class="btn btn-common switch-left-right on"></div>
                <div class="btn btn2 change-bus-stop"></div> <!--バス停を変更するボタン-->
                <div class="btn btn2 change-bus"></div> <!--バスを変更するボタン-->
                <div class="btn btn-common switch-holiday-weekday weekday"></div>
            </div>
        </div>

        <script src="./timetable_list.js"></script>
        <script src="./index.js"></script>
    </body>
</html>