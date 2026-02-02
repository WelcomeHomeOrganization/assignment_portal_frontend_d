import {Card, CardContent} from "@/app/components/ui/card";

interface IProps {
    title: string;
    value: string;
    trend: string;
    trendType: string;
}
export function StatCard({title, value, trend, trendType}: IProps) {
    const isUp = trendType === "up";
    return (
        <Card className="bg-[#161b22] border-gray-800">
            <CardContent className="p-6">
                <p className="text-gray-400 text-sm mb-1">{title}</p>
                <h3 className="text-3xl font-bold mb-2">{value}</h3>
                <p className={`text-xs ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isUp ? '↑' : '↓'} {trend} <span className="text-gray-500">vs last week</span>
                </p>
            </CardContent>
        </Card>
    );
}