/* Featured partners shown (labeled "Featured partner") in personal plans.
   Only signed partners go here. Placement never changes the order of the neutral options.
   Fields:
     name, url, message (one line), banner (optional, e.g. "Applications open until Jan. 31")
     regions:   ["Detroit metro", "West Michigan", "Mid-Michigan", "Thumb", "Southwest",
                 "Northern Lower", "Upper Peninsula", "Statewide"]   (omit = everywhere)
     stages:    ["ms","hs","grad","adult","nodiploma","employer","educator"]  (omit = all)
     interests: ["construction","electrical","mechanical","manufacturing","auto","health","it",
                 "business","education","ag","culinary","safety"]   (omit = all)
   Example (not live):
   { name: "Example Electrical JATC", url: "https://example.org", message: "Paid electrical apprenticeships in West Michigan.",
     banner: "Applications open until Jan. 31", regions: ["West Michigan"], stages: ["hs","grad","adult"], interests: ["electrical"] }
*/
window.SPONSORS = [];
