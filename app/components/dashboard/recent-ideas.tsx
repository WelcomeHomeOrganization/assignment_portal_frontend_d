import {Badge} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";

interface IProps {
    category: string;
    title: string;
    author: string;
    time: string;
    image: string;
}

export function IdeaCard({ category, title, author, time, image }: IProps) {
    return (
        <div className="bg-[#161b22] p-4 rounded-xl border border-gray-800 space-y-3">
            <div className="flex justify-between items-center">
                <Badge className="bg-blue-900/30 text-blue-400 uppercase text-[10px]">
                    {category}
                </Badge>
                <span className="text-gray-500 text-[10px]">{time}</span>
            </div>
            <h4 className="font-semibold text-sm leading-snug">{title}</h4>
            <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                    <AvatarImage src={image} />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-400">by {author}</span>
            </div>
        </div>
    );
}