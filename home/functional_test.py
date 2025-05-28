from selenium import webdriver

# Open the browser and go to the website
browser = webdriver.Chrome()
browser.get('http://localhost:8000')
assert 'Django' in browser.title