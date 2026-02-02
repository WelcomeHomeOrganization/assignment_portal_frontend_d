import {TEAM_MEMBERS} from "@/app/dashboard/data";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import {Button} from "@/app/components/ui/button";


export function TeamList() {
    return (
        <div className="bg-[#161b22] rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Active Team Members</h3>
                <Button variant="link" className="text-blue-500 text-xs">VIEW ALL</Button>
            </div>
            <div className="space-y-4">
                {TEAM_MEMBERS.map((member) => (
                    <div key={member.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#161b22] ${member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent border-gray-700 text-xs hover:bg-gray-800">
                            Assign Task
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}