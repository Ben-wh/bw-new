// ─────────────────────────────────────────────────────────────────────────────
// All projects live here. To add one, copy a block and edit it.
//
// Order = display order (put newest first). The home page shows the projects
// marked `featured: true`, up to 3; if none are featured it shows the first 3.
// Each project gets its own page at  project.html?id=<id>
//
// Fields:
//   id        unique, lowercase-with-dashes; used in the page URL      (required)
//   title     project name                                             (required)
//   summary   one or two sentences, shown on the card                  (required)
//   year      e.g. '2025'
//   tags      list of short labels, e.g. ['Python', 'Networking']
//   featured  true to show on the home page
//   image     path to a screenshot, e.g. 'images/projects/my-project.png'
//   links     list of { label, url }, e.g. GitHub repo, live demo
//   body      the project page content, written as HTML (paragraphs, headings,
//             lists, images...). Use backticks so it can span multiple lines.
//             Spacing helpers you can drop in on their own line:
//               <div class="spacer"></div>      32px gap
//               <div class="spacer sm"></div>   16px gap
//               <div class="spacer lg"></div>   64px gap
//               <hr />                          dashed divider line
//             Buttons (any link can be one; the "$" prompt is added for you):
//               <a class="btn" href="https://…">view source</a>          outlined
//               <a class="btn solid" href="https://…">live demo</a>     filled
//               <a class="btn subtle" href="https://…">read docs</a>    grey
//             Wrap several in <div class="btn-row">…</div> to line them up.
// ─────────────────────────────────────────────────────────────────────────────

window.PROJECTS = [
  {
    id: 'homelab',
    title: 'Homelab',
    summary: 'My first at home lab envrionment named S01.',
    year: '2024 > current',
    tags: ['Networking', 'Linux', 'Ansible', 'Docker'],
    featured: true,
    body: `
      <p>I run a simple Proxmox node from my home as an ad-hoc service hosting and testing environment.
      All services run on KVMs with Ubuntu.</p>

      <hr /> 

      <h3>Current Stack: (Nov 2026)</h3>
      <ul>
        <li>Proxmox (Hypervisor)</li>
        <li>Tailscale</li>
        <li>Pterodactyl and Minecraft server</li>
        <li>Pi-Hole DNS</li>
        <li>Ansible Controller</li>
        <li>Prometheus and Grafana</li>
        <li>Nextcloud</li>
      </ul>
      
      <hr /> 

      <h3>Tailscale</h3>
      <p>My current VPN service which allows me to access my network from anywhere. This prevents me
      having to expose my services to the internet, which effectively adds an extra meaty layer of
      security >:)</p>

      <h3>Pterodactyl and Minecraft</h3>
      <p>Pterodactyl is essentially just a management console for running Minecraft servers. Each server
      is spun up through docker which allows for efficient resource usage - we all know how intensive MC
      servers can be...

      <h3>Pi-Hole DNS</h3>
      <p>Imagine a world where ads are blocked at network level. Imagine no more; Pi-Hole DNS also acts as
      my DHCP server to automatically provision DNS server addresses to my devices. Network level ad-blocking...
      that's goated. </p>

      <h3>Ansible Controller</h3>
      <p>This was more of a learning opportunity - even though I am lazy enough to spend hours automating "apt update
      && apt upgrade". It did allow me to deploy a custom service to each KVM to send an alert through a discord webhook whenever an SSH connection was established (i was proud of that lol). This taught me loads about ansible automation, playbook creation (YAML), and how to lose SSH access
      to your whole homelab in a single afternoon :P

      <h3>Prometheus and Grafana</h3>
      <p>Compiling and sending data from each container into a pretty dashboard showing resource usage and security alerts. icl I haven't finished the dashboard yet but
      it's a cool idea and a good learning opportunity none-the-less.

      <h3>Nextcloud</h3>
      <p>I can never have too much cloud storage... This was the first service I deployed on my Homelab.</p>

      <h3>Other Uses</h3>
      <p>There have been many times where I just need an environment for some ad-hoc testing. Such like comparing 2 operating systems
      for a university assignment or practicing my ansible skills before an event.

      <hr /> 

      <h3>Future Plans</h3>
      <p>I would like to get a second node and begin to create a cluster, but that may be far off with RAM prices atm.
      Definitely have an OpenClaw instance on my mind too; Jarvis IRL. I'd like to experiment with Kubernetes soon as well.
    `,
  },
  {
    id: 'remee-hutchings',
    title: 'Remée Hutchings Site',
    summary: 'Portfolio site centered around a technical theatre theme.',
    year: '2026',
    tags: ['Programming', 'Web'],
    featured: true,
    body: `
      <p>A website for my partner and her technical theatre portfolio. Simple HTML, CSS, JS stack.</p>
      <a class="btn" target="_blank" href="https://rhutchings.co.uk">view the site</a>
      
      <hr />
      
      <h3>The Idea</h3>
      <p>My idea was an elegantly desgined portfolio website to show off skills, experience, and shows. It would be a gold
      and black theme with little, gimmicky technical theatre features scattered around the functionality of the site.</p>

      <hr />

      <h3>Result</h3>
      <p>I was pretty happy with the result, mostly due to the fact I didn't just vibecode the whole thing.
      My favourite feature was probably the mixing desk slider which shuffled through her experience page. Go
      check out the site and tell me what you think, or what needs changing :)
    `,
  },
  {
    id: 'lithium',
    title: 'Lithium',
    summary: 'Self-hosted, fully open source ticketing software.',
    year: '2026 > current',
    tags: ['Programming', 'Python', 'Web', 'Docker'],
    featured: true,
    body: `<p>Nothing here yet. Mainly because the project isn't finished...</p>`,
  },
];
