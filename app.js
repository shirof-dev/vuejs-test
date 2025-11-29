const { createApp, ref, onMounted } = Vue;

const app = createApp({
    setup() {
        // リアクティブなデータ
        const chartData = ref(null); // グラフのデータ
        const fileName = ref('ファイルが選択されていません');
        let salesChart = null; // Chart.jsインスタンスを保持する変数

        /**
         * CSVファイルを読み込むイベントハンドラ
         * @param {Event} event - input[type="file"]のchangeイベント
         */
        const handleFileUpload = (event) => {
            const file = event.target.files[0];
            if (file) {
                fileName.value = file.name;
                
                // Papa Parseを使ってファイルからデータをパース
                // header: true にすると、最初の行をヘッダー（キー）としてオブジェクト配列に変換
                Papa.parse(file, {
                    header: true, 
                    dynamicTyping: true, // 数値は数値型として解析
                    complete: (results) => {
                        console.log("CSVパース結果:", results.data);
                        
                        // グラフ表示用にデータを整形
                        prepareChartData(results.data);
                    },
                    error: (error) => {
                        console.error("CSVパースエラー:", error);
                        alert("ファイルの読み込み中にエラーが発生しました。");
                    }
                });
            }
        };

        /**
         * パースされたCSVデータからChart.js用のデータ構造を作成
         * @param {Array<Object>} data - Papa Parseの結果データ
         */
        const prepareChartData = (data) => {
            if (data.length === 0) {
                chartData.value = null;
                updateChart();
                return;
            }

            // CSVの列名が 'Month' と 'Sales' であることを想定
            const labels = data.map(row => row.Month);
            const sales = data.map(row => row.Sales);

            chartData.value = {
                labels: labels,
                datasets: [
                    {
                        label: '売上 (Sales)',
                        data: sales,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)', // 青色
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            };

            // グラフを更新または新規作成
            updateChart();
        };

        /**
         * Chart.jsのグラフを更新または初期化
         */
        const updateChart = () => {
            const ctx = document.getElementById('salesChart');

            if (salesChart) {
                // 既存のグラフがあれば更新
                if (chartData.value) {
                    salesChart.data = chartData.value;
                    salesChart.update();
                } else {
                    // データがない場合はグラフを破棄
                    salesChart.destroy();
                    salesChart = null;
                }
                return;
            }

            // グラフがまだ存在しない場合の初期化
            if (ctx && chartData.value) {
                salesChart = new Chart(ctx, {
                    type: 'bar', // 棒グラフ
                    data: chartData.value,
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'CSVデータからの売上グラフ'
                            }
                        }
                    }
                });
            }
        };

        // マウント時にグラフコンポーネントを初期化 (初回描画用)
        onMounted(() => {
            updateChart();
        });

        // テンプレートに公開する変数とメソッド
        return {
            fileName,
            handleFileUpload
        };
    },
    // テンプレート部分
    template: `
        <h2>📊 CSVファイルアップロードとグラフ表示</h2>
        <div>
            <input type="file" @change="handleFileUpload" accept=".csv" id="csvFile">
            <p>選択中のファイル: <strong>{{ fileName }}</strong></p>
        </div>
        
        <div>
            <canvas id="salesChart"></canvas>
        </div>
    `
});

app.mount('#app');

