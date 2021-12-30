import sys
import requests
import os
url_template = 'https://bs-cdn-video.highso.com.cn/4381705evodtranscq1500000473/{id}/v.f124030_{num}.ts'
if __name__ == "__main__":
    infile = sys.argv[1]
    dir = sys.argv[2]
    os.mkdir(dir)

    with open(infile, 'r') as f:
        lines = f.readlines()
        for l in lines:
            item = l.split('|')
            name = item[0]
            id = item[1].split('/')[-2]
            dest_dir = dir + '/' + name
            os.mkdir(dest_dir)
            for i in range(1, 10000):
                url = url_template.format(id=id, num=i)
                try:
                    r = requests.get(url, allow_redirects=True)
                    dest_file = dest_dir + '/' + str(i) + '.ts'
                    with open(dest_file, 'wb') as ff:
                        ff.write(r.content);
                except:
                    break
    
