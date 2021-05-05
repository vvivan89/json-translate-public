import React from 'react';
import { VictoryBar, VictoryChart,VictoryAxis,VictoryTheme,VictoryTooltip } from 'victory';

//chart shows monthly API usage percentage (based on 500,000 characters of free quota)
export function UsageChart({stats}){

    //sort periods ascending (first year, then months within each year)
    const sortedStats=stats.sort((a,b)=>{
        if(a.year===b.year){return a.month-b.month}
        return a.year-b.year
    }).map(item=>{

        //add percentage based on 500,000 free symbols
        return {
            ...item,
            usage:Math.round(item.chars/50)/100
        }
    })

    //horizontal axis -> months
    //vertical axis -> % of usage
    // tooltip shows both % and number of chars
    return (
        <div style={{height:250}}>
            <VictoryChart 
                theme={VictoryTheme.material}
                domainPadding={0}
                style={{
                    parent: { width:'fit-content',marginLeft:10 }, //to align chart on the left
                    data: { fill: "tomato", opacity: 0.7 },
                  }}
            >
                <VictoryAxis crossAxis
                    theme={VictoryTheme.material}
                    standalone={false}
                />
                <VictoryAxis dependentAxis crossAxis
                    standalone={false}
                    theme={VictoryTheme.material}
                    offsetX={20}
                    tickFormat={t=>`${t}%`}
                />
                <VictoryBar
                    data={sortedStats}
                    x="string"
                    y="usage"
                    style={{
                        //if usage exceeds free quota, shows in red
                        data: { fill: ({ datum }) => datum.usage > 1000 ? "tomato" : "darkgreen" }, 
                      }}
                    labels={({ datum }) =>`Chars: ${datum.chars.toLocaleString()}\n${datum.usage}% of free Google API quota`}
                    labelComponent={
                        <VictoryTooltip 
                            dy={10} 
                            constrainToVisibleArea
                            cornerRadius={5}
                            flyoutStyle={{ 
                                //if usage exceeds free quota, shows in red
                                stroke:  ({ datum }) => datum.usage > 1000 ? "tomato" : "darkgreen", 
                                strokeWidth: 2,
                                fill:'white',
                            }}
                            style={{ fontSize:16 }}
                            flyoutPadding={15}
                        />
                    }
                />
            </VictoryChart>
        </div>
    )
}