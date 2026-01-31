import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Share2, Plus, Flag, MoreHorizontal } from 'lucide-react';

const MOCK_POSTS = [
	{
		id: 1,
		author: "Sarah Jenkins",
		avatar: "SJ",
		time: "2 hours ago",
		title: "The new streetlights on 4th Avenue are amazing!",
		content: "Just wanted to say kudos to the city team. The LED lights make the street feel so much safer at night. Great improvement!",
		upvotes: 45,
		comments: 12,
		tag: "Appreciation",
		type: "positive"
	},
	{
		id: 2,
		author: "LocalResident_99",
		avatar: "LR",
		time: "5 hours ago",
		title: "Garbage collection missed again in Sector 7?",
		content: "This is the second week in a row that the truck hasn't come by Tuesday morning. Anyone else facing this issue? It's starting to pile up.",
		upvotes: 82,
		comments: 34,
		tag: "Complaint",
		type: "negative"
	},
	{
		id: 3,
		author: "SymbiWatcher",
		avatar: "CW",
		time: "1 day ago",
		title: "Proposal: Weekend Pedestrian Zone on Market Street",
		content: "I think it would be great for local businesses if we closed off Market St to cars on Sundays. It works well in other cities!",
		upvotes: 156,
		comments: 58,
		tag: "Suggestion",
		type: "neutral"
	}
];

const CitizenForum = () => {
	const [posts, setPosts] = useState(MOCK_POSTS);
	const [newPost, setNewPost] = useState("");

	const handleVote = (id, delta) => {
		setPosts(posts.map(post =>
			post.id === id ? { ...post, upvotes: post.upvotes + delta } : post
		));
	};

	return (
		<div className="max-w-5xl mx-auto mb-14">
			<header className="page-header mb-8">
				<h1 className="page-title text-3xl">Community Forum</h1>
				<p className="page-subtitle text-lg">Discuss local issues, share ideas, and connect with neighbors.</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Main Feed */}
				<div className="lg:col-span-3 space-y-6">

					{/* Create Post Input */}
					<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex gap-4 items-center cursor-pointer hover:border-gray-300 transition-colors">
						<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
							ME
						</div>
						<input
							type="text"
							placeholder="Create a post"
							className="bg-gray-100 border-none outline-none rounded-lg px-4 py-2 flex-grow hover:bg-white border border-transparent hover:border-gray-300 transition-all font-medium text-gray-600"
						/>
						<button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
							<ImageIcon size={20} />
						</button>
					</div>

					{/* Posts List */}
					{posts.map(post => (
						<div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
							<div className="flex">
								{/* Vote Sidebar */}
								<div className="w-12 bg-gray-50 border-r border-gray-100 flex flex-col items-center py-4 gap-1">
									<button
										onClick={() => handleVote(post.id, 1)}
										className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-orange-500 transition-colors"
									>
										<ThumbsUp size={20} />
									</button>
									<span className="font-bold text-sm text-gray-700 my-1">{post.upvotes}</span>
									<button
										onClick={() => handleVote(post.id, -1)}
										className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-blue-500 transition-colors"
									>
										<ThumbsDown size={20} />
									</button>
								</div>

								{/* Content */}
								<div className="p-4 flex-grow">
									<div className="flex items-center gap-2 mb-2">
										<div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
											{post.avatar}
										</div>
										<span className="text-xs font-bold text-gray-700 hover:underline cursor-pointer">{post.author}</span>
										<span className="text-xs text-gray-400">• {post.time}</span>
										{post.tag && (
											<span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-auto ${post.type === 'positive' ? 'bg-green-100 text-green-700' :
												post.type === 'negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
												}`}>
												{post.tag}
											</span>
										)}
									</div>

									<h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{post.title}</h3>
									<p className="text-gray-600 text-sm leading-relaxed mb-4">
										{post.content}
									</p>

									<div className="flex items-center gap-4 text-xs font-bold text-gray-500">
										<button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors">
											<MessageSquare size={16} />
											{post.comments} Comments
										</button>
										<button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors">
											<Share2 size={16} />
											Share
										</button>
										<button className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition-colors ml-auto">
											<Flag size={14} />
											Report
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Right Sidebar */}
				<div className="hidden lg:block space-y-6">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
						<div className="flex items-center justify-between mb-4">
							<h3 className="font-bold text-gray-800">About Forum</h3>
							<MoreHorizontal size={16} className="text-gray-400" />
						</div>
						<p className="text-xs text-gray-500 leading-relaxed mb-4">
							Welcome to the SymbiConnect Community Forum. Use this space to discuss local matters, propose ideas, and organize community events.
						</p>
						<div className="flex items-center gap-4 text-sm font-bold border-t pt-4">
							<div className="flex flex-col">
								<span className="text-gray-900">4.2k</span>
								<span className="text-xs text-gray-400 font-normal">Members</span>
							</div>
							<div className="flex flex-col">
								<span className="text-green-600 flex items-center gap-1">
									<span className="w-2 h-2 rounded-full bg-green-500"></span>
									128
								</span>
								<span className="text-xs text-gray-400 font-normal">Online</span>
							</div>
						</div>
						<button className="btn btn-primary w-full mt-4 rounded-full text-sm py-2">Create Post</button>
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
						<h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Community Rules</h3>
						<ul className="space-y-2">
							{['Be Respectful', 'No Hate Speech', 'Keep it Local', 'No Spam'].map((rule, i) => (
								<li key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium py-1 border-b last:border-0 border-gray-50">
									<span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-[10px]">{i + 1}</span>
									{rule}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

const ImageIcon = ({ size }) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
		<circle cx="8.5" cy="8.5" r="1.5" />
		<polyline points="21 15 16 10 5 21" />
	</svg>
);

export default CitizenForum;
