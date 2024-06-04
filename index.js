const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    var rs = "<div> Guildline </div>"
    rs += "<div>Hello, This API will update realtime price gold in Vietnam, exactly</div>"
    rs+= "<div>Endpoint: https://gia-vang-sjc.vercel.app/gia-vang"
   // res.status(200).send("Hello, This API will update realtime price gold in Vietnam, exactly");
    res.status(200).send(rs);
});


app.get('/gia-vang', async (req, res) => {
    try {
        const {data} = await axios.get('https://sjc.com.vn/giavang/textContent.php');
        const $ = cheerio.load(data);

        const updateTimeText = $('.w350.m5l.float_left.red_text.bg_white').text().trim();

        const updateTime = new Date(updateTimeText.replace(
            /(\d{2}):(\d{2}):(\d{2}) (AM|PM) (\d{2})\/(\d{2})\/(\d{4})/,
            (match, p1, p2, p3, p4, p5, p6, p7) => {
                let hour = parseInt(p1);
                if (p4 === 'PM' && hour !== 12) hour += 12;
                if (p4 === 'AM' && hour === 12) hour = 0;
                return `${p7}-${p6}-${p5}T${hour.toString().padStart(2, '0')}:${p2}:${p3}`;
            }
        ));

        const goldPrices = [];

        $('table tr').each((i, element) => {
            const loaiVang = $(element).find('td').eq(0).text().trim();
            const giaMua = $(element).find('td').eq(1).text().trim();
            const giaBan = $(element).find('td').eq(2).text().trim();

            if (loaiVang && giaMua && giaBan) {
                goldPrices.push({
                    loaiVang,
                    giaMua,
                    giaBan
                });
            }
        });

        res.json({
            "time": updateTimeText,
            "total": goldPrices.length,
            "data": goldPrices,
            "author": "Theodore Myker"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});

app.listen(port, () => {
    console.log(`Server đang chạy ở port ${port}`);
});
