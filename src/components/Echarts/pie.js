import { useCallback, useEffect } from "react";
import * as echarts from 'echarts'
/**
 *  @description：封装全局通用echarts 饼图组件
 *  @param {string} id 图表dom元素
 *  @param {string} title 图表标题
 *  @param {array} sourceData 图表数据
 * @param {string} type 图表显示类别
*/
const usePieEcharts = (props) => {
    const { id, title,type, sourceData } = props;
  
    const drawMultiplePie = useCallback(() => {
        // 获取DOM ID    
        let pieChartDom = document.getElementById(id);
        // 获取实例
        let pieChart = echarts.getInstanceByDom(pieChartDom);
        // 如果不存在则创建
        if (!pieChart) {
            // 如果扇形图显示类别是支出统计分析
            if (type === 'consumeAnalysisType') {
                pieChart = echarts.init(pieChartDom, null, {
                    renderer: 'svg',
                    width: 300,
                    height: 340
                });
            } else {
                pieChart = echarts.init(pieChartDom);
            }
            
        }
        // 适配移动端<576px的屏幕
        let fontBySize;
        if (document.documentElement.clientWidth < 576) { 
             fontBySize = 16;
        } else {
             fontBySize = 18;
        }
        let multipleOptions = {
                title: {
                    text: title,
                    left: "center",
                    // 主标题文字的字体大小
                    textStyle: {
                        fontSize:[fontBySize]
                    }
                },
                legend: {
                    orient: "horizontal",
                    top: 'bottom',
                    show:false,
                },
                grid: {
                    containLabel: true
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)'
                },
                series: [
                    {
                        name: '详情',
                        type: 'pie',
                        radius : [100,130],
                        center: ['50%', '50%'],
                        // roseType: 'radius',
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '28',
                                fontWeight: 'bold'
                            }
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        data:sourceData
                    }
                ]
        };
        pieChart.setOption(multipleOptions);

        window.addEventListener('resize', () => {
            pieChart.resize();     
        })
    }, [id, title, type,sourceData]) 
    
    // 监听数据变化，重新渲染图表
    useEffect(() => {
        drawMultiplePie(); 
    },[drawMultiplePie])

    return (
        <div id={id} title={title} style={{ width: '100%', height: '100%' }}></div>  
    )
}
export default usePieEcharts;