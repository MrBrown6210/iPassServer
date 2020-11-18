# iPass-Server

iPass-Server คือ Server ของระบบ iPass เป็นอุปกรณ์สำหรับทำ contact tracking เพื่อให้สามารถติดตามดูการเคลื่อนไหวข้อผู้ทดลองได้

โดยในช่วงแรกจะทดลองเกี่ยวกับโรคติดต่อเช่น **Covid-19** เป็นต้น

## Build Setup

```bash

# install dependencies

$ npm install



# serve with hot reload at localhost:3030

$ npm run serve



# build for production and launch server

$ npm run build

$ npm run start
(pm2 start npm --name "iPass-Server" -- run start:prod)

```

## Documents

Database: [MongoDB](https://www.mongodb.com/)

#### รายละเอียดคร่าวๆในการทำงาน

ตอนนี้จะไปใช้ collection **tracks** ใช้ในการเก็บข้อมูลที่ผู้ใช้เจอกัน มีรูปแบบดังนี้

- owner : ผู้ใช้ที่ทำการบันทึกข้อมูล
- found : ผู้ใช้ที่ owner ไปเจอ
- timestamp: เวลาที่บันทึกข้อมูลว่า (UNIX Timestamp)
- stay: เวลาที่ผู้ใช้ทั้ง 2 อยู่ด้วยกันมีหน่วยเป็น millisecond

โดยเมื่อระบุผู้ติดเชื้อ ระบบจะนำข้อมูลมาตรวจสอบว่าผู้ใช้ได้ไปเจอผู้ติดเชื้อหรือไม่

### API

**Create Track**
`POST http://localhost:3030/tracks`
| Body | Description | type |
|--|--|--|
| owner | ID เจ้าของเครื่อง | String |
| found | ID ที่เจอ | String |
| timestamp | เวลาที่ทำการบันทึก (UNIX TIMESTAMP) | Number
| stay | ระยะเวลาที่เจอกันของทั้ง 2 ID | Number |

ตัวอย่างข้อมูลที่ได้

```json
{
  "_id": "5f4cbc1c456c293c17441160",
  "owner": "test1",
  "found": "test4",
  "timestamp": 1598805311,
  "stay": 120000,
  "__v": 0
}
```

**Explore Tracks**
`GET http://localhost:3030/tracks/explore`

| Query     | Description                                 | type   |
| --------- | ------------------------------------------- | ------ |
| diseaseId | ID ที่ติดเชื้อ                              | String |
| day       | จำนวนวันที่จะค้นหา (default: 14)            | Number |
| start     | เวลาที่จะเริ่มค้นหา (default: เวลาปัจจุบัน) | Number |

ตัวอย่างข้อมูลที่ explore ออกมาจาก server

```json
{
  "places": [
    {
      "id": "test3",
      "point": 2.5,
      "alert": 1
    }
  ],
  "personals": [
    {
      "id": "test2",
      "point": 4.1,
      "alert": 1
    },
    {
      "id": "test4",
      "point": 1,
      "alert": 0
    }
  ]
}
```
