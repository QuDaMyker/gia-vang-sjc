const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = 3000;

app.get('/gia-vang', async (req, res) => {
    try {
        const {data} = await axios.get('https://sjc.com.vn/giavang/textContent.php');
        const $ = cheerio.load(data);

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
            "time": new Date().toLocaleString(),
            "data": goldPrices,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi server');
    }
});

app.listen(port, () => {
    console.log(`Server đang chạy ở port ${port}`);
});