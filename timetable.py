from urllib.parse import urlparse
import urllib.request
import requests as req
from bs4 import BeautifulSoup

  #平日右回り --> 平日左回り --> 休日右回り --> 休日左回り
urls:list = [
  'https://www.jorudan.co.jp/bus/rosen/timetable/%E3%81%A4%E3%81%8F%E3%81%B0%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%E3%80%94%E9%96%A2%E6%9D%B1%E9%89%84%E9%81%93%E3%80%95/%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E5%BE%AA%E7%92%B0%EF%BC%BB%E5%8F%B3%E5%9B%9E%E3%82%8A%EF%BC%BD/?Dw=1',
  'https://www.jorudan.co.jp/bus/rosen/timetable/%E3%81%A4%E3%81%8F%E3%81%B0%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%E3%80%94%E9%96%A2%E6%9D%B1%E9%89%84%E9%81%93%E3%80%95/%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E5%BE%AA%E7%92%B0%EF%BC%BB%E5%B7%A6%E5%9B%9E%E3%82%8A%EF%BC%BD/?Dw=1',
  'https://www.jorudan.co.jp/bus/rosen/timetable/%E3%81%A4%E3%81%8F%E3%81%B0%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%E3%80%94%E9%96%A2%E6%9D%B1%E9%89%84%E9%81%93%E3%80%95/%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E5%BE%AA%E7%92%B0%EF%BC%BB%E5%8F%B3%E5%9B%9E%E3%82%8A%EF%BC%BD/',
  'https://www.jorudan.co.jp/bus/rosen/timetable/%E3%81%A4%E3%81%8F%E3%81%B0%E3%82%BB%E3%83%B3%E3%82%BF%E3%83%BC%E3%80%94%E9%96%A2%E6%9D%B1%E9%89%84%E9%81%93%E3%80%95/%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E5%BE%AA%E7%92%B0%EF%BC%BB%E5%B7%A6%E5%9B%9E%E3%82%8A%EF%BC%BD/',
]

timetable_url:list =[]
for url in urls:
  req = urllib.request.Request(url)
  with urllib.request.urlopen(req) as res:
    body = res.read().decode('utf-8') #htmlを文字列としてbodyに格納

  soup = BeautifulSoup(body, 'html.parser')
  div_c0 = soup.find_all('div', class_='c0')

  l:list = []
  for p in div_c0:
    url:str = p.a.get('href')
    correct_url = 'https://www.jorudan.co.jp' + url
    l.append(correct_url)

  timetable_url.append(l)

# print(len(timetable_url[0]))

timetable:list = [] #3次元配列
for i in range(len(timetable_url)):
  tl:list = []
  for url in timetable_url[i]:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as res:
        body = res.read().decode('utf-8') #htmlを文字列としてbodyに格納
    
    soup = BeautifulSoup(body, 'html.parser')

    l:list = []
    for p in soup.find_all('td', class_='time'):
      time_text:str = p.get_text()
      time_text = time_text + '00'
      if '発' in time_text:
        time:str = time_text.replace(' 発', '')
        time = time.replace(':', '')
      elif '着' in time_text:
        time:str = time_text.replace(' 着', '')
        time = time.replace(':', '')
      l.append(time)
    tl.append(l)
  timetable.append(tl)

# print(timetable)

  #平日右回り --> 平日左回り --> 休日右回り --> 休日左回り
days = ['平日右回り','平日左回り', '休日右回り', '休日左回り']
with open('timetable.txt', 'w') as f:
  f.write('[')
  for i in range(len(timetable)):
    f.write(days[i])
    f.write('[')
    for j in range(len(timetable[i])):
      f.write('[')
      for n in range(len(timetable[i][j])):
        f.write(timetable[i][j][n])
        if(n != len(timetable[i][j])-1):
          f.write(', ')
      f.write(']\n')
    f.write(']\n')
  f.write(']\n')

