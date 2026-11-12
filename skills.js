// ─────────────────────────────────────────────────────────────────────────────
// Skills shown in the terminal on the home page. Each group is printed as a
// folder (e.g. ./languages/) with its skills as icons underneath.
//
// Skill fields:
//   name   shown under the icon                                          (required)
//   icon   a Simple Icons name — search https://simpleicons.org and use the
//          slug from the URL, e.g. 'python', 'wireshark', 'kalilinux'.
//          Or a path to your own SVG/PNG, e.g. 'images/skills/nmap.svg'.
//          Leave it out to show the first letters of the name instead.
//   color  optional hex (no #) to light up with instead of the brand colour —
//          useful when the brand colour is too dark for the background.
//   note   printed in the terminal when someone hovers/taps the skill
// ─────────────────────────────────────────────────────────────────────────────

window.SKILLS = [
  {
    dir: 'languages',
    items: [
      { name: 'Python', icon: 'python', note: 'scripting, automation and tooling along with some projects' },
      { name: 'Bash', icon: 'gnubash', note: 'shell scripting on Linux' },
      { name: 'JavaScript', icon: 'javascript', note: 'web maigic' },
      { name: 'HTML', icon: 'html5', note: 'building web pages' },
      { name: 'CSS', icon: 'css', note: 'styling and animation' },
      { name: 'MySQL', icon: 'mysql', note: '(is sql a language? who knows) databases' },
    ],
  },
  {
    dir: 'os',
    items: [
      { name: 'Ubuntu', icon: 'ubuntu', note: 'my #1 desktop and server environment' },
      { name: 'Kali Linux', icon: 'kalilinux', note: 'offensive security testing' },
      { name: 'RedHat', icon: 'redhat', note:"red hat enterprise linux" },
      { name: 'MacOS', icon: 'apple', color: 'f0f6fc', note: 'apple fanboy' },
      { name: 'Windows', icon: 'images/skills/windows.svg', note: 'ew.' },
    ],
  },
  {
    dir: 'security',
    items: [
      { name: 'Wireshark', icon: 'wireshark', note: 'packet capture and analysis' },
      { name: 'Burp Suite', icon: 'burpsuite', note: 'web application testing' },
      { name: 'Metasploit', icon: 'metasploit', note: 'exploitation framework' },
      { name: 'Nmap', note: 'network scanning and enumeration' },
      { name: 'Splunk', icon:"splunk", color: "f0f6fc", note: 'siem tooling' },
      { name: 'Elastic', icon:"elastic", note: 'siem tooling' },
    ],
  },
  {
    dir: 'systems',
    items: [
      { name: 'Git', icon: 'git', note: 'version control' },
      { name: 'Docker', icon: 'docker', note: 'containerisation' },
      { name: 'Ansible', icon: 'ansible', note: 'scalable command and code automation' },
      { name: 'Grafana', icon: 'grafana', note: 'data visualisation' },
      { name: 'AWS', icon: 'images/skills/aws.svg', note: 'cloud cloud cloud' },
    ],
  },
];
