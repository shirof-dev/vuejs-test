const { createApp, ref, onMounted } = Vue;

// 1. CSVファイルのパスを定義
const CSV_FILE_PATH = './data.csv'; 

const app = createApp({
    setup() {
        // リアクティブなデータ
        const chartData = ref(null); // グラフのデータ
        const loadStatus = ref('CSVファイルを読み込み中...'); // 読み込みステータス
        let salesChart = null; // Chart.jsインスタンスを保持する変数

        /**
         * サーバー上のCSVファイルを読み込む関数
         */
        const loadCsvData = () => {
            loadStatus.value = 'CSVファイルを読み込み中...';
            
            // Papa Parseを使ってファイルのURLからデータをパース
            Papa.parse(CSV_FILE_PATH, {
                download: true, // URLからファイルをダウンロードしてパースすることを指定
                header: true,   // 最初の行をヘッダー（キー）としてオブジェクト配列に変換
                dynamicTyping: true, // 数値は数値型として解析
                complete: (results) => {
                    console.log("CSVパース結果:", results.data);
                    loadStatus.value = 'データ読み込み完了。';
                    
                    // グラフ表示用にデータを整形
                    prepareChartData(results.data);
                },
                error: (error) => {
                    console.error("CSVパースエラー:", error);
                    loadStatus.value = `データの読み込みに失敗しました: ${error.message}`;
                    alert("ファイルの読み込み中にエラーが発生しました。Webサーバーがファイルを公開しているか確認してください。");
                }
            });
        };

        /**
         * パースされたCSVデータからChart.js用のデータ構造を作成 (変更なし)
         */
        const prepareChartData = (data) => {
            // ... (前回のコードから変更なし) ...
            if (data.length === 0) {
                chartData.value = null;
                updateChart();
                return;
            }

            const labels = data.map(row => row.Month);
            const sales = data.map(row => row.Sales);

            chartData.value = {
                labels: labels,
                datasets: [
                    {
                        label: '売上 (Sales)',
                        data: sales,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }
                ]
            };

            updateChart();
        };

        /**
         * Chart.jsのグラフを更新または初期化 (変更なし)
         */
        const updateChart = () => {
            // ... (前回のコードから変更なし) ...
            const ctx = document.getElementById('salesChart');

            if (salesChart) {
                if (chartData.value) {
                    salesChart.data = chartData.value;
                    salesChart.update();
                } else {
                    salesChart.destroy();
                    salesChart = null;
                }
                return;
            }

            if (ctx && chartData.value) {
                salesChart = new Chart(ctx, {
                    type: 'bar',
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

        // マウント時に、ファイル読み込み関数をすぐに実行
        onMounted(() => {
            loadCsvData(); 
        });

        // テンプレートに公開する変数とメソッド
        return {
            loadStatus
            // handleFileUploadは不要になるため削除
        };
    },
    // テンプレート部分を更新
    template: `
        <h2>📊 サーバー上のデータ (data.csv) のグラフ表示</h2>
        <p>ステータス: <strong>{{ loadStatus }}</strong></p>
        
        <div>
            <canvas id="salesChart"></canvas>
        </div>
    `
});

app.mount('#app');
