import sys
import requests
import os
url_template = 'https://bs-cdn-video.highso.com.cn/4381705evodtranscq1500000473/{id}/v.f124030_{num}.ts'
if __name__ == "__main__":
    infile = sys.argv[1]
    dir = sys.argv[2]
    if not os.path.exists(dir):
        os.mkdir(dir)

    with open(infile, 'r') as f:
        lines = f.readlines()
        for l in lines:
            item = l.split('|')
            if len(item) != 2:
                continue
            name = item[0]
            id = item[1].split('/')[-2]
            dest_dir = dir + '/' + name
            if not os.path.exists(dest_dir):
                os.mkdir(dest_dir)
            else:
                continue
            for i in range(1, 10000):
                url = url_template.format(id=id, num=i)
                try:
                    r = requests.get(url, allow_redirects=True)
                    if r.status_code == 404:
                        break
                    dest_file = dest_dir + '/' + str(i) + '.ts'
                    with open(dest_file, 'wb') as ff:
                        ff.write(r.content);
                except:
                    break
            print(name + ' done')
    
