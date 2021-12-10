from random import uniform

import chromedriver_binary

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
# 今後使うかも（？）
# from selenium.webdriver.common.keys import Keys as keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementNotInteractableException
from selenium.webdriver.common.keys import Keys

from time import sleep

def make_driver() :
    
    options = Options()
    # options.add_argument('--headless')
    driver = webdriver.Chrome(options=options)
    
    return driver
    
def main() :
    driver = make_driver()
    
    right_lot_url = "https://www.jorudan.co.jp/bus/rosen/"
    left_lot_url = "https://www.jorudan.co.jp/bus/rosen/timetable/%E5%90%88%E5%AE%BF%E6%89%80%E3%80%94%E9%96%A2%E6%9D%B1%E9%89%84%E9%81%93%E3%80%95/%E7%AD%91%E6%B3%A2%E5%A4%A7%E5%AD%A6%E5%BE%AA%E7%92%B0%EF%BC%BB%E5%B7%A6%E5%9B%9E%E3%82%8A%EF%BC%BD/"

    driver.get(right_lot_url)
    driver.find_element_by_xpath("//*[@class='buslist place']/li[3]/ul/li[2]").click()
    sleep(5)
    
    # スクレイピング対策されている
    print(driver.find_element("//*[@class='heading2']").text)

if __name__ == "__main__" :
    main()